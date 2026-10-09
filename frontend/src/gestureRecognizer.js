function calculateAngle(a, b, c) {
  const radians = Math.atan2(
    c.y - b.y,
    c.x - b.x
  ) -
    Math.atan2(
      a.y - b.y,
      a.x - b.x
    );

  let angle = Math.abs(
    (radians * 180) / Math.PI
  );

  if (angle > 180) {
    angle = 360 - angle;
  }

  return angle;
}

function isFingerExtended(
  landmarks,
  mcp,
  pip,
  tip
) {
  const angle = calculateAngle(
    landmarks[mcp],
    landmarks[pip],
    landmarks[tip]
  );

  return angle > 150;
}

function isPinching(landmarks) {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];

  const dx = thumbTip.x - indexTip.x;
  const dy = thumbTip.y - indexTip.y;

  const distance = Math.sqrt(
    dx * dx + dy * dy
  );

  return distance < 0.05;
}

export function recognizeGesture(landmarks) {
  if (!landmarks || landmarks.length !== 21) {
    return "UNKNOWN";
  }
  if (isPinching(landmarks)) {
    return "PINCH";
  }

  const indexExtended = isFingerExtended(
    landmarks,
    5,
    6,
    8
  );

  const middleExtended = isFingerExtended(
    landmarks,
    9,
    10,
    12
  );

  const ringExtended = isFingerExtended(
    landmarks,
    13,
    14,
    16
  );

  const pinkyExtended = isFingerExtended(
    landmarks,
    17,
    18,
    20
  );

  const extendedCount = [
    indexExtended,
    middleExtended,
    ringExtended,
    pinkyExtended,
  ].filter(Boolean).length;

  if (
    indexExtended &&
    middleExtended &&
    ringExtended &&
    pinkyExtended
  ) {
    return "OPEN_PALM";
  }

  if (
    indexExtended &&
    !middleExtended &&
    !ringExtended &&
    !pinkyExtended
  ) {
    return "ONE";
  }

  if (
    indexExtended &&
    middleExtended &&
    !ringExtended &&
    !pinkyExtended
  ) {
    return "PEACE";
  }

  if (extendedCount === 0) {
    return "FIST";
  }

  return "UNKNOWN";
}