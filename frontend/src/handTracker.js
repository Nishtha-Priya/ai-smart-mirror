import {
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

let handLandmarker = null;

export async function initializeHandTracker() {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    handLandmarker = await HandLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "/models/hand_landmarker.task",
        },

        runningMode: "VIDEO",

        numHands: 2,
      }
    );

    console.log("Hand Landmarker initialized!");

    return true;
  } catch (error) {
    console.error(
      "MediaPipe initialization error:",
      error
    );

    return false;
  }
}

export function detectHands(video) {
  if (!handLandmarker) {
    return null;
  }

  return handLandmarker.detectForVideo(
    video,
    performance.now()
  );
}