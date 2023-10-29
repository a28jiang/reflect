from cloudAPI import visionAPI
from imageUtil import cropImage, deleteFolder
from google.cloud import vision
import json


def testNestedImageCropCalls():
        with open('./recognition/test/sample.json', 'r') as json_file:
                data = json.load(json_file)

        for object in data['objects']:
                imageID = cropImage("./recognition/test/test3.png", object)
                imagePath = f"./recognition/processing/{imageID}.png"
        
        with open(imagePath, "rb") as image_file:
                content = image_file.read()
                visionData = visionAPI(content=content, features=[{'type_': vision.Feature.Type.LABEL_DETECTION }, {'type_': vision.Feature.Type.LOGO_DETECTION }])
                print("NICE", imageID,  visionData)

        deleteFolder('./recognition/processing')
