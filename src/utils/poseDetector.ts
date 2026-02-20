import { Pose, Options as PoseOptions, Results } from '@mediapipe/pose';

export class PoseDetector {
    private pose: Pose;

    constructor(options?: PoseOptions) {
        this.pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
            ...options
        });
    }

    onResults(callback: (results: Results) => void) {
        this.pose.onResults(callback);
    }

    async send(image: HTMLVideoElement | HTMLCanvasElement) {
        await this.pose.send({ image });
    }

    close() {
        this.pose.close();
    }
}
