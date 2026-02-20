import React, { useEffect, useRef, useState, useMemo } from 'react';
import { PoseDetector } from '../utils/poseDetector';
import { Results } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

interface PoseAnalyzerProps {
    videoFile: File;
    onAnalysisUpdate?: (results: Results) => void;
}

export const PoseAnalyzer: React.FC<PoseAnalyzerProps> = ({ videoFile, onAnalysisUpdate }) => {
    console.log("PoseAnalyzer rendering for file:", videoFile.name);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const requestRef = useRef<number>();
    const poseDetectorRef = useRef<PoseDetector | null>(null);

    const videoUrl = useMemo(() => {
        if (!videoFile) return '';
        const url = URL.createObjectURL(videoFile);
        console.log("Created video URL:", url);
        return url;
    }, [videoFile]);

    useEffect(() => {
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
        };
    }, [videoUrl]);

    useEffect(() => {
        // Initialize PoseDetector
        poseDetectorRef.current = new PoseDetector();
        poseDetectorRef.current.onResults(onResults);

        return () => {
            poseDetectorRef.current?.close();
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const onResults = (results: Results) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Match canvas physical resolution to video internal resolution
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.poseLandmarks) {
            drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 4
            });
            drawLandmarks(ctx, results.poseLandmarks, {
                color: '#FF0000',
                lineWidth: 2
            });

            if (onAnalysisUpdate) onAnalysisUpdate(results);
        }
        ctx.restore();
    };

    const processVideo = async () => {
        if (!videoRef.current || !poseDetectorRef.current || videoRef.current.paused || videoRef.current.ended) {
            setIsProcessing(false);
            return;
        }

        try {
            await poseDetectorRef.current.send(videoRef.current);
        } catch (error) {
            console.error("Critical: Pose detection failed!", error);
            setIsProcessing(false);
            return; // Stop the loop on critical error
        }
        requestRef.current = requestAnimationFrame(processVideo);
    };

    const handlePlay = () => {
        setIsProcessing(true);
        processVideo();
    };

    const handlePause = () => {
        setIsProcessing(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    useEffect(() => {
        if (videoRef.current && videoUrl) {
            console.log("Forcing video reload for URL:", videoUrl);
            videoRef.current.load();
        }
    }, [videoUrl]);

    return (
        <div className="relative w-full h-full bg-black flex justify-center items-center rounded-xl overflow-hidden group">
            <video
                key={videoUrl}
                ref={videoRef}
                src={videoUrl}
                controls
                playsInline
                muted
                className="max-w-full max-h-full object-contain"
                onPlay={handlePlay}
                onPause={handlePause}
            />
            <canvas
                ref={canvasRef}
                className="absolute pointer-events-none"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                }}
            />

            {isProcessing && !videoRef.current?.paused && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full text-xs text-white/70">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    AI Analyzing...
                </div>
            )}
        </div>
    );
};
