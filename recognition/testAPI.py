from cloudAPI import visionAPI
from imageUtil import cropImage, deleteFolder
from google.cloud import vision
import json


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

        # API call to Google Cloud Vision
        with open(imagePath, "rb") as image_file:
            content = image_file.read()
            rawFeatures = visionAPI(
                content=content,
                features=[
                    {"type_": vision.Feature.Type.LABEL_DETECTION},
                    {"type_": vision.Feature.Type.LOGO_DETECTION},
                ],
            )
            visionData.append((imageID, rawFeatures))

    # Feature Regularization for object visionData

    # for object, data in visionData
    deleteFolder("./recognition/processing")
