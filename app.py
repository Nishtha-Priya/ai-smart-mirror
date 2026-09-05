import cv2

from gestures.hand_tracker import HandTracker


# Initialize hand tracker

hand_tracker = HandTracker()


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

    if result.hand_landmarks:

        total_fingers = 0

        for i, hand in enumerate(result.hand_landmarks):

            # MediaPipe handedness
            handedness = (
                result.handedness[i][0].category_name
            )

            # Correct for mirrored camera
            if handedness == "Left":
                handedness = "Right"
            else:
                handedness = "Left"

            # Count fingers
            finger_count = hand_tracker.count_fingers(
                hand,
                handedness
            )

            total_fingers += finger_count

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

            # Display hand information

            wrist = hand[0]

            wrist_x = int(wrist.x * w)
            wrist_y = int(wrist.y * h)

            cv2.putText(
                frame,
                f"{handedness}: {finger_count}",
                (wrist_x - 80, wrist_y - 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

        # Total fingers

        cv2.putText(
            frame,
            f"Total: {total_fingers}",
            (30, 60),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
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