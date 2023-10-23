from google.cloud import vision

client = vision.ImageAnnotatorClient()

def visionAPI(content: any):
  image = vision.Image(content=content)
        
  response = client.annotate_image({
    'image': image,
    'features': [
      {'type_': vision.Feature.Type.LABEL_DETECTION }, 
      {'type_': vision.Feature.Type.OBJECT_LOCALIZATION},
      {'type_': vision.Feature.Type.LOGO_DETECTION},
      ]
  })
  print('res',response)

  imageFeatures = {
    "labels": response.label_annotations,
    "objects": response.localized_object_annotations,
    "logos": response.logo_annotations
  }
  
  return imageFeatures