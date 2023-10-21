from google.cloud import vision


with open("test3.png", "rb") as image_file:
        content = image_file.read()

image = vision.Image(content=content)

client = vision.ImageAnnotatorClient()
response = client.annotate_image({
  'image': image,
  'features': [{'type_': vision.Feature.Type.LABEL_DETECTION }, {'type_': vision.Feature.Type.OBJECT_LOCALIZATION}]
})

print(response)