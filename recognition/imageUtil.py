import base64
from io import BytesIO
from PIL import Image
from colorthief import ColorThief
import os
import shutil
from math import sqrt
from recognition.cloudAPI import visionAPI
import numpy as np
from google.cloud import vision


# Temporary folder to save cropped images
output_directory = "./recognition/processing"

# Standard Google Cloud Vision Feature Request
standardFeatures = [
    {"type_": vision.Feature.Type.LABEL_DETECTION},
    {"type_": vision.Feature.Type.OBJECT_LOCALIZATION},
    {"type_": vision.Feature.Type.LOGO_DETECTION},
]


# Crop Image to Bounding Box
def cropImage(imageData, object):

    binaryData = base64.b64decode(imageData)
    image = Image.open(BytesIO(binaryData))
    vertices = object["boundingPoly"]["normalizedVertices"]
    width, height = image.size
    vertices = [
        (int(vertices[i]["x"] * width), int(vertices[i]["y"] * height))
        for i in range(4)
    ]
    crop = image.crop((vertices[0][0], vertices[0][1], vertices[2][0], vertices[2][1]))

    # Create the output directory if it doesn't exist
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    crop.save(f"{output_directory}/{object['name']}.png")

    buffered = BytesIO()
    crop.save(buffered, format="JPEG")
    crop_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return object["name"], crop_str


# Delete Image Processing Folder
def deleteFolder(folderPath):
    try:
        shutil.rmtree(folderPath)
    except OSError as e:
        print(f"Error: {e}")


# Get Dominant Color
def getDominantColor(imagePath, quality=5):
    colorUtil = ColorThief(imagePath)
    dominantColor = colorUtil.get_color(quality)
    return dominantColor


# Get Color Palette
def getColorPalette(imagePath, count=2, quality=5):
    colorUtil = ColorThief(imagePath)
    palette = colorUtil.get_palette(count, quality)
    return palette


def colorDistance(color1, color2):
    return np.linalg.norm(np.array(color1) - np.array(color2))


def paletteDistance(palette1, palette2):
    total_distance = 0
    for color1 in palette1:
        distances = [colorDistance(color1, color2) for color2 in palette2]
        total_distance += min(distances)
    return total_distance / len(palette1)


def processPicturePath(path, features=standardFeatures):
    with open(path, "rb") as image_file:
        content = image_file.read()
        data = visionAPI(content=content, features=features)
        return data


def processPictureData(image, features=standardFeatures):
    features = visionAPI(content=image, features=features)
    return features


def trimImagePath(image):
    _, data = image.split(",", 1)
    return data
