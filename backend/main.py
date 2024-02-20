from typing import List

from fastapi import Depends, FastAPI, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.database import crud, models, schemas
from backend.database.database import SessionLocal, engine

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


@app.post("/upload_image/")
async def batch_upload_image(image: UploadFile):
    # TODO: create feature vectors for all
    # TODO: write all to DB
    return


@app.post("/upload_image/")
async def upload_image(image: UploadFile):
    # TODO: save to local
    # Define the path where you want to save the file
    file_path = f"C:/Users/moroa/Desktop/temp_images/{image.filename}"

    # Open the file in write-binary mode
    with open(file_path, "wb") as buffer:
        # Read the contents of the uploaded file
        contents = await image.read()
        # Write the contents to the new file
        buffer.write(contents)

    # TODO: generate feature vector

    # TODO: create entryID in DB - cleanup local

    # TODO: compare entry to all other outfits
    # if weak comparsions/ thresholds - create new outfit

    # TODO: return probabilites

    return JSONResponse(content={"message": "Image received"})


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
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


@app.get("/outfits/{outfit_id}", response_model=schemas.Outfit)
def read_outfit(outfit_id: int, db: Session = Depends(get_db)):
    db_outfit = crud.get_outfit(db, outfit_id=outfit_id)
    if db_outfit is None:
        raise HTTPException(status_code=404, detail="Outfit not found")
    return db_outfit


@app.get("/outfits/", response_model=List[schemas.Outfit])
def read_all_outfits(user_id: int, limit: int = 10, db: Session = Depends(get_db)):
    outfits = crud.get_all_outfits(db, user_id=user_id, limit=limit)
    return outfits


@app.post("/entries/", response_model=schemas.Entry)
def create_entry(entry: schemas.EntryCreate, db: Session = Depends(get_db)):
    return crud.create_entry(db=db, entry=entry)
