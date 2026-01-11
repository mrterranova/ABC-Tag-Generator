export function positiveLogTransform(scores: number[], epsilon = 1e-9) {
  const logScores = scores.map(s => Math.log(s + epsilon));
  const minLog = Math.min(...logScores);

  // Shift so the smallest value becomes 0
  return logScores.map(v => v - minLog);
}