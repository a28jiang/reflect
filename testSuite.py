import os
from recognition.compare import compareFeatures
from recognition.recognition import extractPhotoFeatures

from backend.database.database import SessionLocal
from backend.database.crud import create_outfit, get_all_outfits, get_user, create_user
from backend.database.schemas import OutfitCreate, UserCreate
from sqlalchemy.orm import Session
import csv
import re

TEST_USER_ID = 1


def runTestSuite(sharedDBPath, testPath):
    db: Session = SessionLocal()
    try:
        # Create test user if it does not exist
        setUpTestUser(db)

        # Setup database - iterate through all files in the directory
        setUpDB(sharedDBPath, db)
        outfits = get_all_outfits(db, TEST_USER_ID, 1000)

        # Test Photos on database - iterate through all files in the directory
        testPhotos(testPath, outfits)

    finally:
        db.close()
        deleteDB("./reflect.db")


def setUpTestUser(db):
    if not get_user(db, TEST_USER_ID):
        create_user(db, UserCreate(email="test@mail.com", password="test"))


def testPhotos(testPath, outfits, outputDir="output.csv"):
    # for each test image
    allResults = []
    top1Status, top3Status = 0, 0
    for filename in os.listdir(testPath):
        filePath = os.path.join(testPath, filename)
        # grab image properties
        [top, bottom, lighting, color, similar, _] = re.findall(r"[^_|]+", filename)

        if not os.path.isfile(filePath):
            return

        clothingPieces = extractPhotoFeatures(filePath)
        # for each piece in outfit
        for piece in clothingPieces:
            targetPiece = (
                top
                if (piece["name"] == "Top" or piece["name"] == "Outerwear")
                else bottom
            )
            results, target = [], [
                0,
                f"{filename}-{piece['name']}",
                "N/A",
                "N/A",
                lighting,
                color,
                similar,
            ]
            # for every test piece
            for outfit in outfits:
                score = compareFeatures(piece, outfit["features"])
                id = f"test: {piece['name']}-{filename} | against: {outfit['name']}-{outfit['description']}"

                if outfit["description"] == targetPiece:
                    target = [
                        score,
                        f"{filename}-{piece['name']}",
                        outfit["description"],
                        id,
                        lighting,
                        color,
                        similar,
                    ]

                results.append(
                    [score, f"{piece['name']}-{filename}", outfit["description"], id]
                )

            sortedResults = sorted(results, key=lambda x: x[0], reverse=True)
            matcher = "None"
            if target[0] == sortedResults[0][0]:
                matcher = "Top1"
                top1Status += 1
                top3Status += 1
            elif target[0] >= sortedResults[2][0]:
                matcher = "Top3"
                top3Status += 1
            allResults.append(target + sortedResults[0] + [matcher])

    print("ALL", allResults)
    writeToCSV(allResults, outputDir)
    return allResults, top1Status, top3Status


def writeToCSV(data, filename):
    header = [
        "target score",
        "target input",
        "target with",
        "target description",
        "target lighting",
        "target color",
        "target similarity",
        "top score",
        "top input",
        "top with",
        "top description",
        "status",
    ]

    with open(filename, "w", newline="") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(header)
        for row in data:
            writer.writerow(row)


def setUpDB(sharedDBPath, db):
    for filename in os.listdir(sharedDBPath):
        filePath = os.path.join(sharedDBPath, filename)

        if os.path.isfile(filePath):
            vectors = extractPhotoFeatures(filePath)

            for v in vectors:
                outfit = OutfitCreate(
                    name=v["name"],
                    description=filename,
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
