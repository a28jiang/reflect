from cloudAPI import visionAPI

with open("test3.png", "rb") as image_file:
        content = image_file.read()

print(visionAPI(content))
