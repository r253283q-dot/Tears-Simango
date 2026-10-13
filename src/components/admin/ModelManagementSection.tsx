import React, { useState } from 'react';
import { MODEL_BENCHMARKS } from '../../services/storage';
import { analyzeFeedbackText } from '../../services/nlpEngine';
import { Badge } from '../common/Badge';
import { Cpu, CheckCircle2, Play, RefreshCw, Layers, Database } from 'lucide-react';

export const ModelManagementSection: React.FC = () => {
  const [testInput, setTestInput] = useState('Network yenyu paBulawayo irikunetsa zvakanyanya, kodwa customer support was polite.');
  const [testResult, setTestResult] = useState<any>(analyzeFeedbackText(testInput));

  const handleRunInferenceTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;
    const res = analyzeFeedbackText(testInput.trim());
    setTestResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Model Management & Evaluation</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Supervised machine learning baseline and multilingual NLP pipeline status
        </p>
      </div>

      {/* Model Engine Architectural State */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supervised ML Baseline</span>
            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-semibold border border-teal-200">Loaded</span>
          </div>
          <div className="text-base font-bold text-slate-900">Linear SVM & TF-IDF Vectorizer</div>
          <p className="text-xs text-slate-500">
            High-speed linear classification pipeline calibrated on 39,300 cross-vernacular tokens.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Linguistic Parser</span>
            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-semibold border border-teal-200">Active</span>
          </div>
          <div className="text-base font-bold text-slate-900">Zimbabwe Vernacular Tokenizer</div>
          <p className="text-xs text-slate-500">
            Dynamic stem matching across chiShona, isiNdebele, and English-vernacular code-mixing.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inference Pipeline</span>
            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-semibold border border-teal-200">Synchronized</span>
          </div>
          <div className="text-base font-bold text-slate-900">Deterministic Rule + ML Hybrid</div>
          <p className="text-xs text-slate-500">
            Contextual prioritisation rules ensuring instant high-severity incident identification.
          </p>
        </div>
      </div>

      {/* Language Evaluation Benchmarks Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Multilingual Test Set Benchmarks</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical evaluation metrics on independent holdout datasets
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold tracking-wider">
                <th className="py-2.5 px-4">Language Register</th>
                <th className="py-2.5 px-3">Evaluation Corpus Size</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3 text-right">Mean Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {MODEL_BENCHMARKS.map(bm => (
                <tr key={bm.language} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                    {bm.language}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {bm.datasetSize.toLocaleString()} samples
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {bm.accuracy}%
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {bm.precision}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {bm.recall}
                  </td>
                  <td className="py-3 px-3 font-semibold text-teal-700">
                    {bm.f1Score}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600">
                    {bm.latencyMs} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Administrator Model Diagnostic Sandbox */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-semibold text-slate-900">Administrative Inference Diagnostic Sandbox</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test live NLP parser execution on arbitrary multilingual or code-mixed input strings
          </p>
        </div>

        <form onSubmit={handleRunInferenceTest} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Test Sentence Input</label>
            <textarea
              rows={2}
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded font-sans focus:outline-none focus:border-slate-800"
              placeholder="Enter text in English, Shona, Ndebele, or Code-mixed..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Execute Diagnostic Inference</span>
            </button>
          </div>
        </form>

        {testResult && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-3 text-xs">
            <div className="font-semibold text-slate-800">Diagnostic Inference Results:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Detected Sentiment</span>
                <div className="mt-1"><Badge variant="sentiment" value={testResult.sentiment} size="sm" /></div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Language Classification</span>
                <div className="mt-1"><Badge variant="language" value={testResult.language} size="sm" /></div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Identified Category</span>
                <div className="mt-1 font-semibold text-slate-800">{testResult.issue}</div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Severity Priority</span>
                <div className="mt-1"><Badge variant="priority" value={testResult.priority} size="sm" /></div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 text-slate-600">
              <span className="font-semibold text-slate-800">Operational Insight Generated: </span>
              {testResult.customerInsight}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
