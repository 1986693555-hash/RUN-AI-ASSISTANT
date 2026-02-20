import React from 'react';
import { SummaryMetrics } from '../utils/biomechanics';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface DeepAnalysisReportProps {
    summary: SummaryMetrics;
    onClose: () => void;
}

export const DeepAnalysisReport: React.FC<DeepAnalysisReportProps> = ({ summary, onClose }) => {
    const getRiskColor = (level: string) => {
        switch (level) {
            case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'Moderate': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-green-500 bg-green-500/10 border-green-500/20';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
                    <div>
                        <h2 className="text-3xl font-bold mb-1">Deep Biomechanics Report</h2>
                        <p className="text-gray-400">Comprehensive AI-generated running analysis</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <Shield className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-colors">
                            <span className="text-sm text-gray-400 block mb-2 uppercase tracking-wider">Stability Score</span>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold text-primary">{summary.stabilityScore}</span>
                                <span className="text-gray-500 mb-1">/ 100</span>
                            </div>
                            <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-1000"
                                    style={{ width: `${summary.stabilityScore}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-secondary/30 transition-colors">
                            <span className="text-sm text-gray-400 block mb-2 uppercase tracking-wider">Max Knee Flexion</span>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold text-secondary">{summary.maxKneeFlexion}°</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-500 italic">Target: 90° - 110° for sprint drive</p>
                        </div>

                        <div className={`rounded-2xl p-6 border ${getRiskColor(summary.riskLevel)}`}>
                            <span className="text-sm block mb-2 uppercase tracking-wider opacity-70">Injury Risk Level</span>
                            <div className="flex items-center gap-3">
                                {summary.riskLevel === 'Low' ? <CheckCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                                <span className="text-3xl font-bold">{summary.riskLevel}</span>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Analysis */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" /> Key Observations
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">Avg. Vertical Oscillation</span>
                                        <span className="font-mono text-primary">{summary.avgVerticalOscillation}u</span>
                                    </div>
                                    <p className="text-xs text-gray-500">How much your body bounces vertically during flight phase.</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">Avg. Knee Rotation</span>
                                        <span className="font-mono text-secondary">{summary.avgKneeFlexion}°</span>
                                    </div>
                                    <p className="text-xs text-gray-500">General leg position across the recorded duration.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <ArrowRight className="w-5 h-5 text-accent" /> AI Improvement Plan
                            </h3>
                            <div className="space-y-3">
                                {summary.suggestions.length > 0 ? (
                                    summary.suggestions.map((s, i) => (
                                        <div key={i} className="flex gap-4 bg-accent/10 border border-accent/20 p-4 rounded-xl items-start">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-accent shrink-0" />
                                            <p className="text-sm text-gray-200">{s}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex gap-4 bg-secondary/10 border border-secondary/20 p-4 rounded-xl items-start">
                                        <CheckCircle className="w-5 h-5 text-secondary shrink-0" />
                                        <p className="text-sm text-gray-200">Your form looks excellent! Maintain your current posture and cadence.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                        >
                            Return to Trainer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
