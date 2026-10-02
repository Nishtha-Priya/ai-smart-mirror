import { useEffect, useRef, useState } from "react";
import { recognizeGesture } from "./gestureRecognizer";
import "./App.css";

import {
  initializeHandTracker,
  detectHands,
} from "./handTracker";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState("");
  const [handDetected, setHandDetected] = useState(false);
  const [handTrackerReady, setHandTrackerReady] = useState(false);
  const [gesture, setGesture] = useState("NONE");

  // Start camera
  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 2000 },
            height: { ideal: 5000 },
            facingMode: "user",
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Camera error:", error);
        setCameraError("Unable to access camera.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Initialize MediaPipe
  useEffect(() => {
    const setupHandTracking = async () => {
      const success = await initializeHandTracker();

      if (success) {
        setHandTrackerReady(true);
        console.log("Hand tracking ready!");
      } else {
        console.error(
          "Failed to initialize hand tracking."
        );
      }
    };

    setupHandTracking();
  }, []);

  // Detect hands
  useEffect(() => {
    if (!handTrackerReady) {
      return;
    }

    let animationFrameId;

    const detect = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (
        video &&
        canvas &&
        video.readyState >= 2
      ) {
        const results = detectHands(video);

        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        if (
          results &&
          results.landmarks.length > 0
        ) {
          setHandDetected(true);
          const detectedGesture =
            recognizeGesture(results.landmarks[0]);

          setGesture(detectedGesture);

          const connections = [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],

            [0, 5],
            [5, 6],
            [6, 7],
            [7, 8],

            [5, 9],
            [9, 10],
            [10, 11],
            [11, 12],

            [9, 13],
            [13, 14],
            [14, 15],
            [15, 16],

            [13, 17],
            [17, 18],
            [18, 19],
            [19, 20],

            [0, 17],
          ];

          results.landmarks.forEach((hand) => {
            // Draw connections
            connections.forEach(([start, end]) => {
              const startPoint = hand[start];
              const endPoint = hand[end];

              ctx.beginPath();

              ctx.moveTo(
                startPoint.x * canvas.width,
                startPoint.y * canvas.height
              );

              ctx.lineTo(
                endPoint.x * canvas.width,
                endPoint.y * canvas.height
              );

              ctx.strokeStyle = "#00ffcc";
              ctx.lineWidth = 3;

              ctx.stroke();
            });

            //Draw landmarks
            hand.forEach((landmark) => {
              const x = landmark.x * canvas.width;
              const y = landmark.y * canvas.height;

              ctx.beginPath();

              ctx.arc(x, y, 5, 0, 2 * Math.PI);

              ctx.fillStyle = "#ffffff";

              ctx.fill();
            });
          });
        } else {
          setHandDetected(false);
          setGesture("NONE");
        }
      }

      animationFrameId =
        requestAnimationFrame(detect);
    };

    detect();

    return () => {
      cancelAnimationFrame(
        animationFrameId
      );
    };
  }, [handTrackerReady]);

  return (
    <div className="mirror">
      <header className="top-bar">
        <div className="logo">
          ✦ AI MIRROR
        </div>

        <div className="time">
          10:42
        </div>
      </header>

      <main className="mirror-content">
        <section className="greeting">
          <p className="small-text">
            GOOD EVENING
          </p>

          <h1>
            Welcome to your mirror ✨
          </h1>
        </section>

        <section className="camera-container">
          {cameraError ? (
            <div className="camera-placeholder">
              <div className="camera-icon">
                ⚠️
              </div>

              <p>{cameraError}</p>

              <span>
                Please allow camera access.
              </span>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="camera-feed"
                autoPlay
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="landmark-canvas"
              />
            </>
          )}
        </section>

        <section className="modules">
          <div className="module-card">
            <span className="module-icon">🎨</span>
            <h3>Filters</h3>
            <p>Explore visual effects</p>
          </div>

          <div className="module-card">
            <span className="module-icon">🌤️</span>
            <h3>Weather</h3>
            <p>Today's forecast</p>
          </div>

          <div className="module-card">
            <span className="module-icon">💪</span>
            <h3>Fitness</h3>
            <p>Track your workout</p>
          </div>

          <div className="module-card">
            <span className="module-icon">🎵</span>
            <h3>Music</h3>
            <p>Control your music</p>
          </div>
        </section>
      </main>

      <footer className="gesture-status">
        <div
          className={
            handDetected
              ? "gesture-dot active"
              : "gesture-dot"
          }
        />

        <span>
          {handDetected
            ? `Gesture: ${gesture}`
            : "Waiting for hand..."}
        </span>
      </footer>
    </div>
  );
}

export default App;