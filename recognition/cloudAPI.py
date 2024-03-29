from google.cloud import vision
from google.oauth2 import service_account
import json

credentials = service_account.Credentials.from_service_account_file(
    "recognition/service.json"
)

client = vision.ImageAnnotatorClient(credentials=credentials)
standardFeatures = [
    {"type_": vision.Feature.Type.LABEL_DETECTION},
    {"type_": vision.Feature.Type.OBJECT_LOCALIZATION},
    {"type_": vision.Feature.Type.LOGO_DETECTION},
]


def visionAPI(content: any, features):
    image = vision.Image(content=content)
    response = client.annotate_image({"image": image, "features": features})

    jsonResponse = convertResponse(response)
    imageFeatures = {
        "labels": (
            jsonResponse["labelAnnotations"]
            if "labelAnnotations" in jsonResponse
            else []
        ),
        "objects": (
            jsonResponse["localizedObjectAnnotations"]
            if "localizedObjectAnnotations" in jsonResponse
            else []
        ),
        "logos": (
            jsonResponse["logoAnnotations"] if "logoAnnotations" in jsonResponse else []
        ),
    }

    return imageFeatures


def convertResponse(vision_response):
    """
    a function defined to take a convert the
    response from vision api to json object  transformation via protoBuff

    Args:
            vision_response
    Returns:
            json_object
    """
    from google.protobuf.json_format import MessageToJson

    json_obj = MessageToJson((vision_response._pb))
    # to dict items
    r = json.loads(json_obj)
    return r
