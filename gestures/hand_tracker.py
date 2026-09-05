import cv2
import math
import mediapipe as mp

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


class HandTracker:

    def __init__(self, model_path="models/hand_landmarker.task"):

        base_options = python.BaseOptions(
            model_asset_path=model_path
        )

        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            num_hands=2,
            min_hand_detection_confidence=0.5,
            min_hand_presence_confidence=0.5,
            min_tracking_confidence=0.5
        )

        self.detector = vision.HandLandmarker.create_from_options(
            options
        )

    # Detect hands

    def detect(self, frame):

        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )

        return self.detector.detect(mp_image)
    
    # Calculate angle between 3 points

    def calculate_angle(self, a, b, c):

        angle = math.degrees(
            math.atan2(c.y - b.y, c.x - b.x)
            -
            math.atan2(a.y - b.y, a.x - b.x)
        )

        angle = abs(angle)

        if angle > 180:
            angle = 360 - angle

        return angle
    
    # Determine whether a finger is extended

    def is_finger_extended(self, hand, mcp, pip, dip, tip):

        angle = self.calculate_angle(
            hand[mcp],
            hand[pip],
            hand[tip]
        )

        return angle > 150

    # Count fingers

    def count_fingers(self, hand, handedness):

        count = 0

        # Index
        if self.is_finger_extended(
            hand, 5, 6, 7, 8
        ):
            count += 1

        # Middle
        if self.is_finger_extended(
            hand, 9, 10, 11, 12
        ):
            count += 1

        # Ring
        if self.is_finger_extended(
            hand, 13, 14, 15, 16
        ):
            count += 1

        # Pinky
        if self.is_finger_extended(
            hand, 17, 18, 19, 20
        ):
            count += 1

        # Thumb
        thumb_angle = self.calculate_angle(
            hand[2],
            hand[3],
            hand[4]
        )

        if thumb_angle > 150:
            count += 1

        return count

    def recognize_gesture(self, hand, handedness):

        # Pinch(priority)
        if self.is_pinching(hand):
            return "PINCH"

        finger_count = self.count_fingers(
            hand,
            handedness
        )

        # Fist
        if finger_count == 0:
            return "FIST"

        # One finger
        if finger_count == 1:
            return "ONE"

        # Peace sign
        if finger_count == 2:

            index_up = self.is_finger_extended(
                hand, 5, 6, 7, 8
            )

            middle_up = self.is_finger_extended(
                hand, 9, 10, 11, 12
            )

            if index_up and middle_up:
                return "PEACE"

        # Three fingers
        if finger_count == 3:
            return "THREE"

        # Open palm
        if finger_count == 5:
            return "OPEN_PALM"

        return "UNKNOWN"

    def is_pinching(self, hand):

        thumb = hand[4]
        index = hand[8]

        distance = math.sqrt(
            (thumb.x-index.x)**2+(thumb.y-index.y)**2
        )

        return distance < 0.05

    # Close detector

    def close(self):

        self.detector.close()