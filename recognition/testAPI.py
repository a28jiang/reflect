from cloudAPI import visionAPI
from imageUtil import (
    cropImage,
    deleteFolder,
    getDominantColor,
    getColorPalette,
    observePicture,
)
from google.cloud import vision
import json
import numpy as np
from data import labels, objects, logos


# Scaffold for backend flow
def testNestedImageCropCalls(path):
    data = observePicture(path, [{"type_": vision.Feature.Type.OBJECT_LOCALIZATION}])

    # Process cropped objects
    visionData = []
    for object in data["objects"]:
        # Exit if irrelevant object
        if object["name"] not in objects.objectSet:
            continue

        imageID = cropImage(path, object)
        subPath = f"./recognition/processing/{imageID}.png"
        colors = {
            "dominant": getDominantColor(subPath),
            "palette": getColorPalette(subPath),
        }

        # API call to Google Cloud Vision
        rawFeatures = observePicture(subPath)
        visionData.append([object["name"], object["score"], colors, rawFeatures])

    # Feature Vector Construction
    for data in visionData:
        [name, score, color, features] = data
        vectors = constructFeatureVectors(features, name, score, color)
        # TODO: Add vector to backend
        print(vectors)

    # Cleanup image processing foldler
    deleteFolder("./recognition/processing")


# Utility for constructing Label, Object and Logo feature vectors
def constructFeatureVectors(features, name, score, color):
    # Label Vector
    labelV = populateVector(features["labels"], labels.labelData, labels.labelSet)

    # Object Vector
    objectV = populateVector(features["objects"], objects.objectData, objects.objectSet)
    objectV[objects.objectSet[name]] = score  # override score

    # Logo Vector
    logoV = populateVector(features["logos"], logos.logoData, logos.logoSet)

    return {
        "name": name,
        "label": labelV,
        "object": objectV,
        "logo": logoV,
        "color": color,
    }


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


testNestedImageCropCalls("./recognition/test/test8.png")
