from cloudAPI import visionAPI
from imageUtil import cropImage, deleteFolder, getDominantColor
from google.cloud import vision
import json
import numpy as np
from data import labels, objects


# Scaffold for backend flow
def testNestedImageCropCalls():
    # Load dummy data
    with open("./recognition/test/sample_initial_call.json", "r") as json_file:
        data = json.load(json_file)

    # Process cropped objects
    visionData = []
    for object in data["objects"]:
        imageID = cropImage("./recognition/test/test3.png", object)
        imagePath = f"./recognition/processing/{imageID}.png"
        dominantColor = getDominantColor(imagePath)

        # API call to Google Cloud Vision
        with open(imagePath, "rb") as image_file:
            content = image_file.read()
            rawFeatures = visionAPI(content=content)
            visionData.append(
                [object["name"], object["score"], dominantColor, rawFeatures]
            )

    # Feature Vector Construction
    for data in visionData:
        [name, score, color, features] = data
        vectors = constructFeatureVectors(features, name, score)

    # Cleanup image processing foldler
    deleteFolder("./recognition/processing")


# Utility for constructing Label, Object and Logo feature vectors
def constructFeatureVectors(features, name, score):
    # Label Vector
    labelV = populateVector(features["labels"], labels.labelData, labels.labelSet)

    # Object Vector
    objectV = populateVector(features["objects"], objects.objectData, objects.objectSet)
    objectV[objects.objectSet[name]] = score  # override score

    # TODO: Logo Vector
    # logoV = populateVector(features['logos'], logoData, logoSet)

    return labelV, objectV


# Utility for populating empty vector based on category
def populateVector(category, keys, keySet):
    vector = np.zeros(len(keys))
    for obj in category:
        if "name" in obj:
            name = obj["name"]
        elif "description" in obj:
            name = obj["description"]
        value = obj["score"]
        if name in keySet:
            vector[keySet[name]] = value
    return vector


# testNestedImageCropCalls()
