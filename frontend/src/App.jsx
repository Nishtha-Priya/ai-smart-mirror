import { useEffect, useRef, useState } from "react";
import "./App.css";

import {
  initializeHandTracker,
  detectHands,
} from "./handTracker";

import { recognizeGesture } from "./gestureRecognizer";

const handConnections = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];
 const filters = [
  { name: "Normal", description: "Natural reflection", emoji: "◉" },
  { name: "Grayscale", description: "Classic monochrome", emoji: "◐" },
  { name: "Warm", description: "Golden hour glow", emoji: "☀" },
  { name: "Cool", description: "Cool blue tones", emoji: "❄" },
  { name: "Vintage", description: "Retro film look", emoji: "✧" },
  { name: "Blur", description: "Soft focus", emoji: "◎" },
];

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraError, setCameraError] = useState("");
  const [handDetected, setHandDetected] = useState(false);
  const [handTrackerReady, setHandTrackerReady] = useState(false);
  const [gesture, setGesture] = useState("NONE");
  const [currentScreen, setCurrentScreen] = useState("HOME");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState(0);

  useEffect(() => {
    let stream;
    let cancelled = false;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: "user",
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {
        console.error("Camera error:", error);
        if (!cancelled) {
          setCameraError("Camera unavailable. Check browser permissions.");
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function setupHandTracking() {
      try {
        const success = await initializeHandTracker();

        if (!cancelled && success) {
          setHandTrackerReady(true);
        }
      } catch (error) {
        console.error("Hand tracking setup failed:", error);
      }
    }

    setupHandTracking();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!handTrackerReady) return;

    let animationFrameId;
    let lastVideoTime = -1;

    const detect = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (
        video &&
        canvas &&
        video.readyState >= 2 &&
        video.videoWidth > 0
      ) {
        if (
          canvas.width !== video.videoWidth ||
          canvas.height !== video.videoHeight
        ) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;

          try {
            const results = detectHands(video);
            const hands = results?.landmarks ?? [];

            setHandDetected(hands.length > 0);

            if (hands.length > 0) {
              setGesture(recognizeGesture(hands[0]));
            } else {
              setGesture("NONE");
            }

            hands.forEach((hand) => {
              ctx.strokeStyle = "#72ffe0";
              ctx.lineWidth = 3;
              ctx.lineCap = "round";

              handConnections.forEach(([start, end]) => {
                ctx.beginPath();
                ctx.moveTo(
                  hand[start].x * canvas.width,
                  hand[start].y * canvas.height
                );
                ctx.lineTo(
                  hand[end].x * canvas.width,
                  hand[end].y * canvas.height
                );
                ctx.stroke();
              });

              hand.forEach((point) => {
                ctx.beginPath();
                ctx.arc(
                  point.x * canvas.width,
                  point.y * canvas.height,
                  4,
                  0,
                  Math.PI * 2
                );
                ctx.fillStyle = "#ffffff";
                ctx.fill();
              });
            });
          } catch (error) {
            console.error("Hand detection error:", error);
          }
        }
      }

      animationFrameId = requestAnimationFrame(detect);
    };

    detect();

    return () => cancelAnimationFrame(animationFrameId);
  }, [handTrackerReady]);

  const formattedTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mirror">
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

      <div className="mirror-shade" />

      <header className="mirror-header">
        <div className="mirror-brand">✦ AI MIRROR</div>
        <div className="connection-status">
          <span className={handTrackerReady ? "status-light ready" : "status-light"} />
          {handTrackerReady ? "AI READY" : "INITIALIZING"}
        </div>
      </header>

      {cameraError ? (
        <div className="camera-error">{cameraError}</div>
      ) : (
        <section className="mirror-widgets">
          <div className="welcome-widget">
            <p className="eyebrow">YOUR PERSONAL SPACE</p>
            <h1>Good {currentTime.getHours() < 12 ? "morning" : currentTime.getHours() < 17 ? "afternoon" : "evening"}.</h1>
            <p className="date-label">{formattedDate}</p>
            <div className="clock">{formattedTime}</div>
          </div>

          <div className="weather-widget glass-widget">
            <span className="widget-icon">☀</span>
            <div>
              <p className="eyebrow">WEATHER</p>
              <h2>--°</h2>
              <p>Forecast coming soon</p>
            </div>
          </div>

          <div className="quick-widgets">
            <button
              className="glass-widget quick-card"
              onClick={() => setCurrentScreen("FILTERS")}
            >
              <span>✧</span>
              <strong>Filters</strong>
              <small>Explore effects</small>
            </button>

            <button className="glass-widget quick-card" onClick={() => setCurrentScreen("WEATHER")}>
              <span>☼</span>
              <strong>Weather</strong>
              <small>Local forecast</small>
            </button>

            <button className="glass-widget quick-card" onClick={() => setCurrentScreen("FITNESS")}>
              <span>⌁</span>
              <strong>Fitness</strong>
              <small>Movement tracking</small>
            </button>

            <button className="glass-widget quick-card" onClick={() => setCurrentScreen("MUSIC")}>
              <span>♫</span>
              <strong>Music</strong>
              <small>Listening space</small>
            </button>
          </div>
          {currentScreen !== "HOME" && (
            <section className="selection-panel glass-widget">
              <button
                className="panel-close"
                onClick={() => setCurrentScreen("HOME")}
                aria-label="Return home"
              >
                ×
              </button>

              {currentScreen === "FILTERS" ? (
                <>
                  <p className="eyebrow">PERSONALIZE YOUR REFLECTION</p>
                  <h2>Choose your filter</h2>
                  <p className="filter-instruction">
                    Select a look for your mirror
                  </p>

                  <div className="filter-list">
                    {filters.map((filter, index) => (
                      <button
                        key={filter.name}
                        className={`filter-option ${
                          selectedFilter === index ? "selected" : ""
                        }`}
                        onClick={() => setSelectedFilter(index)}
                      >
                        <span className="filter-emoji">
                          {filter.emoji}
                        </span>

                        <span className="filter-details">
                          <strong>{filter.name}</strong>
                          <small>{filter.description}</small>
                        </span>

                        {selectedFilter === index && (
                          <span className="filter-check">✓</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <p className="filter-hint">
                    ✋ Gesture control coming next
                  </p>
                </>
              ) : (
                <>
                  <p className="eyebrow">SMART MIRROR</p>
                  <h2>
                    {currentScreen === "WEATHER"
                      ? "Your weather"
                      : currentScreen === "FITNESS"
                        ? "Fitness studio"
                        : "Music controls"}
                  </h2>
                  <p>This module will be built in a future step.</p>
                </>
              )}
            </section>
          )}
        </section>
      )}

      <footer className="mirror-footer">
        <div className="gesture-indicator">
          <span className={handDetected ? "gesture-light active" : "gesture-light"} />
          <span>{handDetected ? `GESTURE · ${gesture.replace("_", " ")}` : "SHOW YOUR HAND TO BEGIN"}</span>
        </div>

        <div className="footer-hint">
          TOUCHLESS INTERACTION
        </div>
      </footer>
    </main>
  );
}

export default App;