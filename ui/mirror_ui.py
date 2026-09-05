import cv2
import time


class MirrorUI:

    def __init__(self):

        self.mode = "HOME"

        self.filters = [
            "NORMAL",
            "GRAYSCALE",
            "NEGATIVE",
            "BLUR",
            "PIXELATE"
        ]

        self.selected_filter = 0

        # Gesture debouncing
        self.last_gesture = None
        self.last_gesture_time = 0

        self.gesture_cooldown = 0.8

    # Handle gesture
    def handle_gesture(self, gesture):

        current_time = time.time()

        # Ignore repeated same gesture
        if gesture == self.last_gesture:

            if current_time - self.last_gesture_time < self.gesture_cooldown:
                return

        self.last_gesture = gesture
        self.last_gesture_time = current_time

        # Home
        if gesture == "OPEN_PALM":

            self.mode = "HOME"

        # Filters
        elif gesture == "PEACE":

            self.mode = "FILTERS"

        # Next filter
        elif gesture == "ONE":

            if self.mode == "FILTERS":

                self.selected_filter += 1

                if self.selected_filter >= len(self.filters):

                    self.selected_filter = 0

        # Select
        elif gesture == "PINCH":

            if self.mode == "FILTERS":

                print(
                    "Selected:",
                    self.filters[self.selected_filter]
                )

        # Back
        elif gesture == "FIST":

            self.mode = "HOME"

    # Draw UI
    def draw(self, frame, gesture=None):

        h, w, _ = frame.shape

        # Title
        cv2.putText(
            frame,
            "AI SMART MIRROR",
            (30, 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (255, 255, 255),
            2
        )

        # Current mode
        cv2.putText(
            frame,
            f"MODE: {self.mode}",
            (30, 85),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2
        )

        # Gesture
        if gesture:

            cv2.putText(
                frame,
                f"GESTURE: {gesture}",
                (30, h - 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )

        # Home screen
        if self.mode == "HOME":

            cv2.putText(
                frame,
                "PEACE = FILTERS",
                (30, 130),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )

            cv2.putText(
                frame,
                "FIST = HOME",
                (30, 165),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )

        # Filter screen
        elif self.mode == "FILTERS":

            cv2.putText(
                frame,
                "FILTER MODE",
                (30, 130),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 255, 255),
                2
            )

            y = 180

            for i, filter_name in enumerate(self.filters):

                prefix = "> " if i == self.selected_filter else "  "

                cv2.putText(
                    frame,
                    prefix + filter_name,
                    (50, y),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (255, 255, 255),
                    2
                )

                y += 35

            cv2.putText(
                frame,
                "ONE = NEXT",
                (30, h - 80),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2
            )

            cv2.putText(
                frame,
                "PINCH = SELECT",
                (30, h - 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2
            )