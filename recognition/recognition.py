from recognition.imageUtil import (
    cropImage,
    deleteFolder,
    getDominantColor,
    getColorPalette,
    processPictureData,
    trimImagePath,
    processPicturePath,
)
from google.cloud import vision
import numpy as np
from recognition.data import labels, objects, logos
import recognition.colornames


def extractPhotoFeatures(imageData):

    data = processPictureData(
        imageData, [{"type_": vision.Feature.Type.OBJECT_LOCALIZATION}]
    )

    # Process cropped objects
    visionData, visionDataSet = [], set()
    for object in data["objects"]:
        # Exit if irrelevant object or already processed (i.e two shoes)
        if (
            object["name"] not in objects.objectSet
            or object["name"] in visionDataSet
            or object["name"] == "Shoe"
        ):
            continue

        imageID, croppedImage = cropImage(imageData, object)
        subPath = f"./recognition/processing/{imageID}.png"
        color = {
            "dominant": getDominantColor(subPath),
            "palette": getColorPalette(subPath),
        }

        # API call to Google Cloud Vision
        rawFeatures = processPicturePath(subPath)
        visionData.append(
            [object["name"], object["score"], color, rawFeatures, croppedImage]
        )
        visionDataSet.add(object["name"])

    # Feature Vector Construction
    vectorData = []
    for data in visionData:
        [name, score, color, features, croppedImage] = data
        vectors = constructFeatureVectors(
            features, name, score, color, croppedImage, name
        )
        vectors["name"] = (
            recognition.colornames.find(color["dominant"]) + " " + vectors["name"]
        )
        vectorData.append(vectors)

    # Cleanup image processing foldler
    deleteFolder("./recognition/processing")
    return vectorData


# Utility for constructing Label, Object and Logo feature vectors
def constructFeatureVectors(features, name, score, color, image, clothingType):
    # Label Vector
    labelV = populateVector(features["labels"], labels.labelData, labels.labelSet)

    # Object Vector
    objectV = populateVector(features["objects"], objects.objectData, objects.objectSet)
    objectV[objects.objectSet[name]] = score  # override score

    # Logo Vector
    logoV = populateVector(features["logos"], logos.logoData, logos.logoSet)

    return {
        "name": name,
        "image": image,
        "label": labelV,
        "object": objectV,
        "logo": logoV,
        "color": color,
        "type": clothingType,
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
    return vector.tolist()
