from PIL import Image
import os
import shutil

# Temporary folder to save cropped images
output_directory = "./recognition/processing"


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


def deleteFolder(folderPath):
    try:
        shutil.rmtree(folderPath)
    except OSError as e:
        print(f"Error: {e}")
