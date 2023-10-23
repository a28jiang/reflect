from flask import Flask, jsonify
import requests

app = Flask()

@app.route('/capture_image', methods=['POST'])
def capture_image():
    # Perform image capture logic here
    # You can access data sent by the remote server using request.json

    # Example: Capture an image and return a response
    # Replace this with your actual image capture code
    result = "Image captured successfully"
    return jsonify({"message": result})



def send_image(image_path):
    url = 'YOUR_SERVER_URL'
    files = {'image': ('image.jpg', open(image_path, 'rb'), 'image/jpeg')}
    response = requests.post(url, files=files)

    if response.status_code == 200:
        print('Image sent successfully.')
    else:
        print('Failed to send the image.')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)