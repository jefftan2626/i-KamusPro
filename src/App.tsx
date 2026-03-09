/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Book, Languages, ArrowRight, History, Star, Info, Loader2, Volume2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchDictionary, DictionaryEntry } from './services/dictionaryService';

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const handleSearch = async (e?: React.FormEvent, searchWord?: string) => {
    if (e) e.preventDefault();
    const wordToSearch = searchWord || keyword;
    if (!wordToSearch.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await searchDictionary(wordToSearch);
      setResult(data);
      if (!history.includes(wordToSearch)) {
        setHistory(prev => [wordToSearch, ...prev].slice(0, 10));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dictionary data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Book size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-emerald-900">E-Kamus Pro</h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-emerald-600/70 -mt-1">Malaysia Trilingual</p>
            </div>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-emerald-600 transition-colors">Dictionary</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Grammar</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">About</a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Search with Confidence</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Access standard Malaysian Malay, Chinese, and English translations instantly.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter a word (e.g., 'Merdeka', 'Synergy', '合作')..."
              className="w-full h-16 pl-14 pr-32 bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={24} />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-200"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
            </button>
          </form>

          {/* Quick History/Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {history.length > 0 ? (
              history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => { setKeyword(h); handleSearch(undefined, h); }}
                  className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium text-gray-500 hover:border-emerald-200 hover:text-emerald-600 transition-all flex items-center gap-1"
                >
                  <History size={12} /> {h}
                </button>
              ))
            ) : (
              ['Wawasan', 'Integrity', 'Harmoni', 'Inovasi'].map((word) => (
                <button
                  key={word}
                  onClick={() => { setKeyword(word); handleSearch(undefined, word); }}
                  className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium text-gray-500 hover:border-emerald-200 hover:text-emerald-600 transition-all"
                >
                  {word}
                </button>
              ))
            )}
          </div>
        </section>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 text-gray-400"
            >
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="font-medium">Consulting linguistic databases...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-center"
            >
              {error}
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-20"
            >
                {/* Word Header */}
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-1">{result.word}</h2>
                        {result.pronunciation && (
                          <p className="text-emerald-600 font-mono text-sm flex items-center gap-2">
                            <Volume2 size={16} /> {result.pronunciation}
                          </p>
                        )}
                      </div>
                      <button className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all">
                        <Star size={24} />
                      </button>
                    </div>

                    {/* Meanings Grid */}
                    <div className="grid grid-cols-1 gap-6 mt-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Bahasa Melayu
                        </div>
                        <ul className="space-y-2">
                          {result.meanings.malay.map((m, i) => (
                            <li key={i} className="text-gray-700 leading-relaxed pl-4 border-l-2 border-blue-100">{m}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span> 中文 (Chinese)
                        </div>
                        <ul className="space-y-2">
                          {result.meanings.chinese.map((m, i) => (
                            <li key={i} className="text-gray-700 leading-relaxed pl-4 border-l-2 border-red-100">{m}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> English
                        </div>
                        <ul className="space-y-2">
                          {result.meanings.english.map((m, i) => (
                            <li key={i} className="text-gray-700 leading-relaxed pl-4 border-l-2 border-emerald-100">{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Illustration/Image */}
                  {result.imageUrl && (
                    <div className="w-full md:w-64 shrink-0">
                      <div className="aspect-square rounded-3xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50 relative group">
                        <img 
                          src={result.imageUrl} 
                          alt={result.word} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
                          <ImageIcon size={14} className="text-emerald-600" />
                        </div>
                      </div>
                      <p className="text-[10px] text-center text-gray-400 mt-2 uppercase tracking-widest font-medium">Visual Illustration</p>
                    </div>
                  )}
                </div>

              {/* Synonyms & Antonyms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Languages size={16} className="text-emerald-500" /> Synonyms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.synonyms.length > 0 ? result.synonyms.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100">
                        {s}
                      </span>
                    )) : <span className="text-gray-400 italic text-sm">None available</span>}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ArrowRight size={16} className="text-orange-500" /> Antonyms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.antonyms.length > 0 ? result.antonyms.map((a, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-100">
                        {a}
                      </span>
                    )) : <span className="text-gray-400 italic text-sm">None available</span>}
                  </div>
                </div>
              </div>

              {/* Examples */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Info size={16} className="text-blue-500" /> Example Sentences (造句)
                </h3>
                <div className="space-y-8">
                  {result.examples.map((ex, i) => (
                    <div key={i} className="space-y-2 group">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 mt-1 shrink-0">
                          {i + 1}
                        </span>
                        <div className="space-y-2">
                          <p className="text-gray-900 font-medium leading-relaxed">{ex.malay}</p>
                          <p className="text-gray-500 text-sm italic">{ex.chinese}</p>
                          <p className="text-gray-500 text-sm italic">{ex.english}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {result.usage_notes && (
                <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-lg">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-2 opacity-70">Usage Notes</h3>
                  <p className="text-emerald-50 leading-relaxed text-sm">{result.usage_notes}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-gray-400"
            >
              <Book size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Start by searching for a word above</p>
              <p className="text-sm">Explore meanings in BM, CN, and EN</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <Book size={14} />
            </div>
            <span className="font-bold text-gray-900">E-Kamus Pro</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Powered by Gemini AI • Following DBP Malaysian Standards
          </p>
          <div className="flex justify-center gap-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
