import os
from recognition.compare import compareFeatures
from recognition.recognition import extractPhotoFeatures

from backend.database.database import SessionLocal
from backend.database.crud import create_outfit, get_all_outfits, get_user, create_user
from backend.database.schemas import OutfitCreate, UserCreate
from sqlalchemy.orm import Session

TEST_USER_ID = 1


def runTestSuite(sharedDBPath, testPath):
    db: Session = SessionLocal()
    try:
        # Create test user if it does not exist
        setUpTestUser(db)

        # Setup database - iterate through all files in the directory
        setUpDB(sharedDBPath, db)
        outfits = get_all_outfits(db, TEST_USER_ID, 1000)
        for outfit in outfits:
            print(f"id={outfit.id}, name={outfit.name}, feature={outfit.features}")

        # Test Photos on database - iterate through all files in the directory
        # testPhotos(testPath, outfits)
    finally:
        db.close()
        deleteDB("./reflect.db")


def setUpTestUser(db):
    if not get_user(db, TEST_USER_ID):
        create_user(db, UserCreate(email="test@mail.com", password="test"))


def testPhotos(testPath, outfits):
    results = []
    for filename in os.listdir(testPath):
        filePath = os.path.join(testPath, filename)
        if os.path.isfile(filePath):
            vectors = extractPhotoFeatures(filePath)
            for curVector in vectors:
                for outfit in outfits:
                    outfitVector = outfit["features"]
                    results.append(compareFeatures(curVector, outfitVector))


def setUpDB(sharedDBPath, db):
    for filename in os.listdir(sharedDBPath):
        filePath = os.path.join(sharedDBPath, filename)

        if os.path.isfile(filePath):
            vectors = extractPhotoFeatures(filePath)
            for v in vectors:
                outfit = OutfitCreate(
                    name=v["name"],
                    description="A comfortable and stylish outfit",
                    features=v,
                )
                print("adding", v["name"])
                create_outfit(db, outfit, TEST_USER_ID)


def deleteDB(database_path):
    try:
        if os.path.exists(database_path):
            os.remove(database_path)
            print(f"Database file at {database_path} successfully deleted.")
            return True
        else:
            print(f"Database file at {database_path} does not exist.")
            return False
    except Exception as e:
        print(f"Error deleting database file: {str(e)}")
        return False


runTestSuite("./test/sharedDB", "./test/tests")
