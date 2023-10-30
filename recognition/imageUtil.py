from PIL import Image
from colorthief import ColorThief
import os
import shutil

# Temporary folder to save cropped images
output_directory = "./recognition/processing"


# Crop Image to Bounding Box
def cropImage(imagePath, object):
    image = Image.open(imagePath)
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
    return object["name"]


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
