import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link, Check, Download, X, Sparkles, ShieldCheck } from 'lucide-react';

interface ShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  problem: string;
  recommendation: string;
  confidence: number;
}

export default function ShareCard({ isOpen, onClose, problem, recommendation, confidence }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-2xl h-fit z-[101] px-6"
          >
            <div className="bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
              
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Share Decision Snapshot</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* The Card Content (Social-Ready Preview) */}
              <div className="p-8">
                <div 
                  id="share-card-content"
                  className="relative aspect-[1.91/1] w-full bg-[#050505] rounded-2xl border border-white/10 p-10 overflow-hidden flex flex-col justify-between"
                >
                  {/* Branding & Glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] -mr-20 -mt-20" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 blur-[80px] -ml-20 -mb-20" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center space-x-2 mb-8">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white to-neutral-500 flex items-center justify-center">
                        <span className="text-black font-black text-xs">S</span>
                      </div>
                      <span className="text-xl font-black text-white tracking-tighter">SolveOS</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-[0.2em] mb-2 block">Problem</span>
                        <h4 className="text-2xl font-light text-white leading-tight line-clamp-2 italic">
                          &ldquo;{problem}&rdquo;
                        </h4>
                      </div>

                      <div className="pt-2">
                        <span className="text-[10px] uppercase font-bold text-emerald-500/80 tracking-[0.2em] mb-2 block">Verdict</span>
                        <div className="flex items-start space-x-3">
                          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                          <p className="text-xl font-medium text-emerald-500 leading-snug line-clamp-3">
                            {recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-end justify-between border-t border-white/5 pt-6">
                    <div className="flex items-center space-x-6">
                      <div>
                        <span className="text-[8px] uppercase font-bold text-neutral-500 tracking-widest block mb-1">Confidence</span>
                        <span className="text-2xl font-black text-white">{confidence}%</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase font-bold text-neutral-500 tracking-widest block mb-1">Risk Profile</span>
                        <span className="text-xs font-bold text-neutral-300 uppercase italic">Balanced Path</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Verified by SolveOS AI</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleCopyLink}
                  className="flex-grow flex items-center justify-center space-x-2 bg-white text-black font-bold py-4 rounded-2xl hover:bg-neutral-200 transition-all active:scale-[0.98]"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-600" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link className="w-5 h-5" />
                      <span>Copy Share Link</span>
                    </>
                  )}
                </button>
                <button className="flex-grow flex items-center justify-center space-x-2 bg-neutral-800 text-white font-bold py-4 rounded-2xl hover:bg-neutral-700 transition-all border border-white/10 active:scale-[0.98]">
                  <Download className="w-5 h-5" />
                  <span>Download Snapshot</span>
                </button>
              </div>

              <p className="text-center pb-6 text-[10px] text-neutral-600 uppercase tracking-widest">
                Virality Optimization: Snapshot auto-generates for Twitter, LinkedIn, & Threads
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
