function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function isFingerExtended(landmarks, mcp, pip, tip) {
  const wrist = landmarks[0];

  const pipDistance = distance(
    landmarks[pip],
    wrist
  );

  const tipDistance = distance(
    landmarks[tip],
    wrist
  );

  return tipDistance > pipDistance;
}

export function recognizeGesture(landmarks) {
  if (!landmarks || landmarks.length !== 21) {
    return "UNKNOWN";
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