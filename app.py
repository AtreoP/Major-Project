import cv2
from ultralytics import YOLO
from flask import Flask, Response, render_template

app = Flask(__name__)

# Load your custom YOLO model
model = YOLO(r"C:\Users\VEDANT\OneDrive\Desktop\finetuneoutdoor.v1i.yolov11\yolov10n.pt")

# Open the system's default camera (webcam)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Unable to access the camera.")
    exit()

# Set camera resolution (optional)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)  # Width
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)  # Height

# Get class names from the model
class_names = model.names  # Get the list of class names

def generate_frames():
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Unable to read from camera.")
            break

        # Run YOLO model for object detection
        results = model(frame)

        # Loop through the detections
        for result in results:
            if result.boxes is not None:
                for box in result.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    score = box.conf[0]
                    class_id = int(box.cls[0])

                    # Draw bounding boxes
                    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)

                    # Get the class name
                    class_name = class_names[class_id]

                    # Display class label and score
                    label = f"{class_name} ({int(score * 100)}%)"
                    cv2.putText(frame, label, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)

        # Encode the frame to JPEG format
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            continue

        # Yield the frame as a byte stream
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html') # Create a simple index.html

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True)