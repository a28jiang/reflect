from datetime import datetime
import copy
from typing import List, Optional

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Form,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from sqlalchemy.orm import Session

from backend.database import crud, models, schemas
from backend.database.database import SessionLocal, engine

# Import the necessary external modules
from recognition.recognition import extractPhotoFeatures
from recognition.compare import compareFeatures


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Enable CORS (Cross-Origin Resource Sharing) to allow requests from your Raspberry Pi
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# List to store connected WebSocket clients
websocket_clients: List[WebSocket] = []


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def status_check():
    return "server running"


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    # Add the connected WebSocket to the list
    websocket_clients.append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            print("Received:", data)

            # Broadcast the received message to all connected clients
            for client in websocket_clients:
                await client.send_text(data)
    except WebSocketDisconnect as e:
        print(f"WebSocket closed by client: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        try:
            websocket_clients.remove(websocket)
            await websocket.close()
        except Exception as e:
            print(f"Websocket already closed: {e}")


@app.post("/login")
def login_user(
    user_email: str = Form(...),
    user_password: str = Form(...),
    db: Session = Depends(get_db),
):
    user = crud.authenticate_user(db, email=user_email, password=user_password)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid login details",
        )

    return user


@app.post("/users", response_model=schemas.User)
def create_user(
    user_email: str = Form(...),
    user_password: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    db: Session = Depends(get_db),
):
    db_user = crud.get_user_by_email(db, email=user_email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = schemas.UserCreate(
        email=user_email,
        password=user_password,
        first_name=first_name,
        last_name=last_name,
    )

    return crud.create_user(db=db, user=user)


@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.post("/outfits/", response_model=schemas.Outfit)
def create_outfit(
    user_id: int, outfit: schemas.OutfitCreate, db: Session = Depends(get_db)
):
    return crud.create_outfit(db=db, outfit=outfit, user_id=user_id)


@app.put("/outfits/{outfit_id}", response_model=schemas.Outfit)
def update_outfit(
    outfit_id: int, outfit: schemas.OutfitUpdate, db: Session = Depends(get_db)
):
    db_outfit = crud.get_outfit(db, outfit_id)
    if db_outfit is None:
        raise HTTPException(status_code=404, detail="Outfit not found")

    # Update outfit properties
    for field, value in outfit.dict(exclude_unset=True).items():
        setattr(db_outfit, field, value)

    db.commit()
    db.refresh(db_outfit)
    return db_outfit


@app.delete("/outfits/{outfit_id}", response_model=schemas.Outfit)
def delete_outfit(outfit_id: int, db: Session = Depends(get_db)):
    db_outfit = crud.get_outfit(db, outfit_id)
    if db_outfit is None:
        raise HTTPException(status_code=404, detail="Outfit not found")

    db.delete(db_outfit)
    db.commit()

    return db_outfit


@app.get("/outfits/{outfit_id}", response_model=schemas.Outfit)
def read_outfit(outfit_id: int, db: Session = Depends(get_db)):
    db_outfit = crud.get_outfit(db, outfit_id=outfit_id)
    if db_outfit is None:
        raise HTTPException(status_code=404, detail="Outfit not found")
    return db_outfit


@app.get("/outfits/", response_model=List[schemas.Outfit])
def read_all_outfits(user_id: int, limit: int = 10, db: Session = Depends(get_db)):
    outfits = crud.get_all_outfits(db, user_id=user_id, limit=limit)
    outfits = sorted(
        outfits,
        key=lambda outfit: outfit.last_worn or datetime.datetime.min,
        reverse=True,
    )
    return outfits


@app.post("/entries/", response_model=schemas.Entry)
def create_entry(entry: schemas.EntryCreate, db: Session = Depends(get_db)):
    return crud.create_entry(db=db, entry=entry)


@app.get("/entries/{entry_id}", response_model=schemas.Entry)
def read_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = crud.get_entry(db, entry_id=entry_id)
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return db_entry


@app.post("/upload/")
def upload(user_id: int, image: str = Form(...), db: Session = Depends(get_db)):

    # Step 1: Extract features from the image
    features = extractPhotoFeatures(image)

    # Step 2: Create an entry using the feature vector
    clothing_object = []
    for feature in features:
        entry_create = schemas.EntryCreate(
            features=feature, date_created=datetime.now()
        )
        entry = crud.create_entry(db=db, entry=entry_create)

        # Step 3: Get all outfits and compare the extracted feature vector
        all_outfits = crud.get_all_outfits(db, user_id)
        comparison_scores = []
        for outfit in all_outfits:
            score = compareFeatures(feature, outfit.features)
            comparison_scores.append({"outfit": outfit, "score": score})

        # Step 4: Return the top 5 matches
        matches = sorted(comparison_scores, key=lambda x: x["score"], reverse=True)[:6]
        clothing_object.append(
            {
                "matches": matches,
                "id": entry.id,
                "name": feature["name"],
                "features": feature,
            }
        )
    return clothing_object


@app.post("/match/")
def match(
    user_id: int,
    entry_id: int = Form(...),
    outfit_id: int = Form(None),
    name: str = Form(None),
    description: str = Form(None),
    db: Session = Depends(get_db),
):

    entry = crud.get_entry(db, entry_id=entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")

    # Step 1: If no outfit_id is provided, create a new outfit object
    if outfit_id is None:
        outfit = schemas.OutfitCreate(
            name=name,
            description=description,
            features={},
            entries=[],
        )
        outfit = crud.create_outfit(db, outfit, user_id)
        outfit.features = entry.features
        outfit.entries = [entry]
        outfit.thumbnail = entry.features["image"]

        db.commit()

        return {
            "message": f"Successfully created new outfit ${outfit.id}",
            "id": outfit.id,
        }
    else:
        # Step 2: If outfit_id is provided, update the existing outfit object
        outfit = crud.get_outfit(db, outfit_id=outfit_id)
        if outfit is None:
            raise HTTPException(status_code=404, detail="Outfit not found")

        # Step 2a: Add entry to outfit's list of entries
        outfit.entries.append(entry)

        print(len(outfit.entries), outfit.id, entry.id)
        # Step 2b: Update outfit's feature vector property
        updated_features = calculate_weighted_average(
            outfit.features, entry.features, 1 / (len(outfit.entries))
        )
        outfit.features = updated_features
        outfit.last_worn = datetime.now()

        db.commit()

        return {
            "message": f"Successfully matched to existing ${entry_id}",
            "id": outfit_id,
        }


def calculate_weighted_average(v1, v2, weight):

    print("weight", weight)
    newFeatures = copy.deepcopy(v1)

    newFeatures["label"] = (
        np.array(v1["label"]) * (1 - weight) + np.array(v2["label"]) * weight
    ).tolist()
    newFeatures["object"] = (
        np.array(v1["object"]) * (1 - weight) + np.array(v2["object"]) * weight
    ).tolist()
    newFeatures["logo"] = (
        np.array(v1["logo"]) * (1 - weight) + np.array(v2["logo"]) * weight
    ).tolist()
    newFeatures["color"] = {
        "dominant": (
            np.array(v1["color"]["dominant"]) * (1 - weight)
            + np.array(v2["color"]["dominant"]) * weight
        ).tolist(),
        "palette": (
            np.array(v1["color"]["palette"]) * (1 - weight)
            + np.array(v2["color"]["palette"]) * weight
        ).tolist(),
    }

    return newFeatures
