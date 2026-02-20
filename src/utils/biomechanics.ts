import { NormalizedLandmark, Results } from '@mediapipe/pose';

// Pose Landmark Indices (MediaPipe)
// 23: Left Hip, 24: Right Hip
// 25: Left Knee, 26: Right Knee
// 27: Left Ankle, 28: Right Ankle

export interface BioMetrics {
    kneeFlexion: number; // Max knee flexion in swing phase (approx)
    hipExtension: number; // Max hip extension
    verticalOscillation: number; // Vertical bounce (arbitrary units or normalized)
    cadence: number; // Steps per minute (estimated)
    riskScore: number; // 0-10 (10 is high risk)
}

export const calculateAngle = (a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
};

export interface SummaryMetrics {
    avgKneeFlexion: number;
    maxKneeFlexion: number;
    avgVerticalOscillation: number;
    stabilityScore: number; // 0-100
    riskLevel: 'Low' | 'Moderate' | 'High';
    suggestions: string[];
}

export const analyzeFrame = (results: Results): Partial<BioMetrics> => {
    const landmarks = results.poseLandmarks;
    if (!landmarks) return {};

    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];

    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    return {
        kneeFlexion: (leftKneeAngle + rightKneeAngle) / 2, // Average for real-time display
        verticalOscillation: (leftHip.y + rightHip.y) / 2
    };
};

export const calculateSessionSummary = (history: Partial<BioMetrics>[]): SummaryMetrics => {
    const validKnee = history.map(h => h.kneeFlexion).filter((v): v is number => v !== undefined);
    const validVO = history.map(h => h.verticalOscillation).filter((v): v is number => v !== undefined);

    const avgKnee = validKnee.reduce((a, b) => a + b, 0) / (validKnee.length || 1);
    const maxKnee = Math.min(...validKnee); // Remember: smaller angle = more flexion
    const avgVO = validVO.reduce((a, b) => a + b, 0) / (validVO.length || 1);

    // Calculate stability based on VO variance
    const voVariance = validVO.reduce((a, b) => a + Math.pow(b - avgVO, 2), 0) / (validVO.length || 1);
    const stability = Math.max(0, 100 - (voVariance * 10000)); // Arbitrary scaling for UI

    const suggestions: string[] = [];
    if (maxKnee > 140) suggestions.push("Increase knee drive during swing phase to improve efficiency.");
    if (stability < 70) suggestions.push("Focus on core stability to reduce vertical bounce.");
    if (avgKnee > 165) suggestions.push("Your legs remain too straight; consider a softer landing.");

    let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
    if (suggestions.length >= 2) riskLevel = 'High';
    else if (suggestions.length === 1) riskLevel = 'Moderate';

    return {
        avgKneeFlexion: Math.round(avgKnee),
        maxKneeFlexion: Math.round(maxKnee),
        avgVerticalOscillation: parseFloat(avgVO.toFixed(3)),
        stabilityScore: Math.round(stability),
        riskLevel,
        suggestions
    };
};
