import { useState, useCallback } from 'react';
import { UploadSection } from './components/UploadSection';
import { PoseAnalyzer } from './components/PoseAnalyzer';
import { analyzeFrame, BioMetrics, calculateSessionSummary, SummaryMetrics } from './utils/biomechanics';
import { DeepAnalysisReport } from './components/DeepAnalysisReport';
import { Activity, LayoutDashboard, FileText, History } from 'lucide-react';
import { Results } from '@mediapipe/pose';

function App() {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [metrics, setMetrics] = useState<Partial<BioMetrics>>({});
    const [history, setHistory] = useState<Partial<BioMetrics>[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [summary, setSummary] = useState<SummaryMetrics | null>(null);

    const handleAnalysisUpdate = useCallback((results: Results) => {
        const frameMetrics = analyzeFrame(results);
        setMetrics(prev => ({ ...prev, ...frameMetrics }));
        setHistory(prev => [...prev.slice(-1000), frameMetrics]); // Keep last 1000 frames for memory safety
    }, []);

    const generateReport = () => {
        if (history.length < 30) {
            alert("Please play the video for a few seconds to collect enough data for a deep analysis.");
            return;
        }
        const sessionSummary = calculateSessionSummary(history);
        setSummary(sessionSummary);
        setShowReport(true);
    };

    const handleFileSelected = (file: File) => {
        console.log("File selected:", file.name);
        setVideoFile(file);
        setHistory([]);
        setSummary(null);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Header */}
            <header className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-md border-b border-white/10 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-8 h-8 text-primary" />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">
                                RunForm AI
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Pro-Grade Analysis</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-12 px-4 max-w-7xl mx-auto">
                {!videoFile ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
                        <div className="text-center space-y-6 max-w-3xl">
                            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                                Perfect Your Running Form <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                    With AI Precision
                                </span>
                            </h1>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                Upload your running video and get instant feedback on your biomechanics,
                                injury risk, and efficiency. No wearables required.
                            </p>
                        </div>

                        <UploadSection
                            onFileSelected={handleFileSelected}
                            className="w-full max-w-xl aspect-video shadow-2xl shadow-primary/10"
                        />
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <h2 className="text-3xl font-bold flex items-center gap-3">
                                    <LayoutDashboard className="w-8 h-8 text-primary" />
                                    Analysis Dashboard
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">Analyzing: {videoFile.name}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={generateReport}
                                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                >
                                    <FileText className="w-4 h-4" /> Generate Deep Report
                                </button>
                                <button
                                    onClick={() => {
                                        setVideoFile(null);
                                        setMetrics({});
                                        setHistory([]);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                                >
                                    New Video
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden relative group shadow-2xl">
                                <PoseAnalyzer videoFile={videoFile} onAnalysisUpdate={handleAnalysisUpdate} />
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl">
                                    <div className="flex items-center gap-2 mb-6 text-primary">
                                        <History className="w-5 h-5" />
                                        <h3 className="text-lg font-semibold text-white">Live Biometrics</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <MetricCard
                                            label="Knee Flexion"
                                            value={metrics.kneeFlexion}
                                            unit="°"
                                            color="text-secondary"
                                            description="Angle at peak swing"
                                        />
                                        <MetricCard
                                            label="Vertical Oscillation"
                                            value={metrics.verticalOscillation}
                                            color="text-accent"
                                            description="Body bounce stability"
                                        />
                                        <div className="pt-4 border-t border-white/5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500 uppercase tracking-wider">Frames Captured</span>
                                                <span className="text-primary font-mono">{history.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {showReport && summary && (
                <DeepAnalysisReport
                    summary={summary}
                    onClose={() => setShowReport(false)}
                />
            )}
        </div>
    );
}

function MetricCard({ label, value, unit = "", color, description }: { label: string, value?: number, unit?: string, color: string, description: string }) {
    return (
        <div className="bg-black/20 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start mb-1">
                <span className="text-gray-400 text-sm">{label}</span>
                <span className={`text-2xl font-mono font-bold ${color}`}>
                    {value !== undefined ? (typeof value === 'number' && value < 1 ? value.toFixed(3) : Math.round(value)) + unit : "--"}
                </span>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                {description}
            </p>
        </div>
    );
}

export default App;
