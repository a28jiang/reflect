import asyncio
import websocket
import ssl

base64Image = "data:image/jpeg;base64,..."


def send_data():
    uri = "wss://reflect.loca.lt/ws"  # Replace with your WebSocket server address

    # Assuming base64Image is defined somewhere in your code
    message = base64Image

    ws = websocket.create_connection(uri, sslopt={"cert_reqs": ssl.CERT_NONE})

    try:
        ws.send(message)
    finally:
        ws.close()

    print("WebSocket connection closed after sending messages")


# Run the sender
send_data()
