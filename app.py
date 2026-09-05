import cv2
import time
from ui.mirror_ui import MirrorUI
from gestures.hand_tracker import HandTracker


last_gesture = None
last_gesture_time = 0

GESTURE_COOLDOWN = 0.8

# Initialize hand tracker and ui

hand_tracker = HandTracker()
mirror_ui = MirrorUI()

# Camera setup
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Could not open webcam.")
    exit()

# Main loop

while True:

    ret, frame = cap.read()

    if not ret:
        print("Could not read frame.")
        break

    # Mirror camera
    frame = cv2.flip(frame, 1)

    # Detect hands
    result = hand_tracker.detect(frame)

    # Process detected hands

    gesture = None

    if result.hand_landmarks:

        for i, hand in enumerate(result.hand_landmarks):

            handedness = result.handedness[i][0].category_name

            # Correct mirrored camera handedness
            if handedness == "Left":
                handedness = "Right"
            else:
                handedness = "Left"

            gesture = hand_tracker.recognize_gesture(
                hand,
                handedness
            )

            mirror_ui.handle_gesture(gesture)

            # Draw landmarks
            h, w, _ = frame.shape

            for landmark in hand:

                x = int(landmark.x * w)
                y = int(landmark.y * h)

                cv2.circle(
                    frame,
                    (x, y),
                    5,
                    (0, 255, 0),
                    -1
                )

    # Draw mirror UI
    mirror_ui.draw(
        frame,
        gesture
    )

    # Display

    cv2.imshow(
        "AI Smart Mirror",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord("c"):
        break


cap.release()
hand_tracker.close()
cv2.destroyAllWindows()