// pages/index.js
import { useState, useRef, useEffect } from 'react';

function IconChevron({ open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function IconWand({ className = "w-5 h-5 text-indigo-600" }) {
  // Pen nib icon
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 6.5l4 4L9 19H5v-4l8.5-8.5z"/>
      <path d="M17 2a1 1 0 01.7.3l4 4a1 1 0 010 1.4l-2.1 2.1-5.4-5.4L16.3 2.3A1 1 0 0117 2z"/>
      <path d="M7 22h10v-2H7v2z"/>
    </svg>
  );
}

function IconCopy() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
      <path d="M16 1H8a2 2 0 00-2 2v2H5a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2v-2h1a2 2 0 002-2V3a2 2 0 00-2-2zm-2 16v1a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h1v8a2 2 0 002 2h7zM8 3h8a1 1 0 011 1v11a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1z" />
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-pink-600">
      <path d="M5 3l1.5 3L10 7.5 6.5 9 5 12 3.5 9 0 7.5 3.5 6zM19 10l2 4 4 2-4 2-2 4-2-4-4-2 4-2zM9 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>
    </svg>
  );
}

function CustomDropdown({ value, onChange, options, label }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="mb-4">
      {label && <label className="block mb-2 font-medium">{label}:</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-full px-3 py-2 border border-gray-200 bg-white/80 rounded-lg flex justify-between items-center focus:outline-none backdrop-blur"
        >
          <span className="flex items-center gap-2">
            <IconWand className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
            {value || 'Select...'}
          </span>
          <span className="ml-2 text-gray-500">
            <IconChevron open={open} />
          </span>
        </button>
        {open && (
          <ul className="absolute left-0 right-0 mt-1 border border-gray-200 bg-white/95 rounded-lg shadow-lg z-10 backdrop-blur">
            {options.map((option) => (
              <li
                key={option}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                  option === value ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [responseBody, setResponseBody] = useState('');
  const [loading, setLoading] = useState(false);

  const [tone, setTone] = useState('');
  const toneOptions = ['', 'Casual', 'Formal', 'Friendly', 'Professional'];
  const [essence, setEssence] = useState('');
  const [pointsToInclude, setPointsToInclude] = useState('');

  // Fine Tuning Options - Creativity state
  const [temperature, setTemperature] = useState(1);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Reset temperature on a fresh submission.
    setTemperature(1);
    setResponseBody('');

    try {
      const res = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          tone, 
          essence, 
          pointsToInclude
        }),
      });
      const data = await res.json();
      setResponseBody(data.body);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setLoading(false);
    }
  };

  // Updated handleRegenerate that accepts an option parameter
  const handleRegenerate = async (regenerateOption) => {
    setLoading(true);
    try {
      const res = await fetch('/api/regenerate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentResponse: responseBody,
          regenerateOption,
          tone,
          essence,
          pointsToInclude,
          temperature
        }),
      });
      const data = await res.json();
      setResponseBody(data.body);
    } catch (error) {
      console.error('Error regenerating response:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(responseBody)
      .then(() => alert('Copied to clipboard!'))
      .catch((err) => console.error('Failed to copy text: ', err));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 tracking-tight flex flex-col md:flex-row md:items-center gap-3">
          <span className="inline-flex items-center justify-center p-2 rounded-xl bg-white/70 border border-white/40 shadow self-start md:self-auto">
            <IconSparkles />
          </span>
          <span className="flex flex-wrap gap-x-2 leading-tight break-words">
            <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">EasyReply</span>
            <span className="text-gray-800">— Write Perfect Replies in Seconds</span>
          </span>
        </h1>
        
        {/* 
          Layout:
          - On small screens: 1 column (stack vertically).
          - On md+ screens: 3 columns.
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Customization and Fine Tuning Options */}
        <div className="rounded-2xl p-6 shadow-xl border border-white/40 bg-white/70 backdrop-blur">
          {/* Customize Your Response */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 flex flex-wrap items-center gap-3">
              <IconWand className="w-6 h-6 md:w-7 md:h-7 text-indigo-600" />
              <span>Customize Your Response</span>
              <span className="inline-flex items-center rounded-lg bg-white/70 px-2.5 py-1 text-xs md:text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm backdrop-blur">Optional</span>
            </h2>
            <CustomDropdown
              label="Tone"
              value={tone}
              onChange={setTone}
              options={toneOptions}
            />
            <div className="mb-4">
              <label className="block mb-2 font-medium">Essence of the Reply:</label>
              <input
                type="text"
                value={essence}
                onChange={(e) => setEssence(e.target.value)}
                placeholder="What I want to say is..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Points to Include:</label>
              <input
                type="text"
                value={pointsToInclude}
                onChange={(e) => setPointsToInclude(e.target.value)}
                placeholder="Make sure to include..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow"
              />
            </div>
          </div>
          {/* Fine Tuning Options */}
          <div className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 flex flex-wrap items-center gap-3">
              <IconSparkles />
              <span>Fine Tuning Options</span>
              {!responseBody && (
                <span className="inline-flex items-center rounded-lg bg-white/70 px-2.5 py-1 text-xs md:text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm backdrop-blur">Generate a response first</span>
              )}
            </h2>
            <div className="flex space-x-2">
              <button
                type="button"
                disabled={!responseBody}
                onClick={() => handleRegenerate("shorter")}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-100 to-pink-100 text-gray-800 hover:from-indigo-200 hover:to-pink-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M4 12h12M10 6l-6 6 6 6"/></svg>
                  Shorter
                </span>
              </button>
              <button
                type="button"
                disabled={!responseBody}
                onClick={() => handleRegenerate("longer")}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-100 to-pink-100 text-gray-800 hover:from-indigo-200 hover:to-pink-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20 12H8m6-6l6 6-6 6"/></svg>
                  Longer
                </span>
              </button>
            </div>
            {/* Creativity Fine Tuning Option */}
            <div className="mt-4 text-lg">
              <label className="block text-lg font-bold mt-2 mb-3">Creativity</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const newTemp = Number(Math.max(0, temperature - 0.2).toFixed(1));
                    setTemperature(newTemp);
                    handleRegenerate("temperature");
                  }}
                  disabled={!responseBody || temperature <= 0}
                  className="w-10 h-10 md:w-11 md:h-11 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-pink-100 text-gray-800 shadow hover:shadow-md hover:from-indigo-200 hover:to-pink-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Decrease creativity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M5 12.75a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H5.75a.75.75 0 01-.75-.75z"/></svg>
                </button>
                {/* Percentage badge */}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-gray-700 bg-white/70 border border-gray-200 shadow-sm backdrop-blur min-w-[3.5rem] justify-center">
                  {Math.round((temperature / 2) * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newTemp = Number(Math.min(2, temperature + 0.2).toFixed(1));
                    setTemperature(newTemp);
                    handleRegenerate("temperature");
                  }}
                  disabled={!responseBody || temperature >= 2}
                  className="w-10 h-10 md:w-11 md:h-11 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-pink-100 text-gray-800 shadow hover:shadow-md hover:from-indigo-200 hover:to-pink-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase creativity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.75 5a.75.75 0 00-1.5 0v6.25H5a.75.75 0 000 1.5h6.25V19a.75.75 0 001.5 0v-6.25H19a.75.75 0 000-1.5h-6.25V5z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Email and Generated Response */}
        <div className="md:col-span-2 flex flex-col">
          {/* Email Input */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <IconWand className="w-6 h-6 text-indigo-600" />
              What email are you replying to?
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="rounded-2xl p-6 shadow-xl border border-white/40 bg-white/70 backdrop-blur">
                <textarea
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste your email here... (Press Enter to submit, Shift+Enter for a new line)"
                  className="w-full h-52 mb-4 focus:outline-none bg-transparent placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full px-4 py-3 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-pink-600 shadow hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      <IconWand className="w-5 h-5 text-white" />
                      Generate Response
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Generated Response */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 flex items-center gap-2">Generated Response:</h2>
            <div className="rounded-2xl p-6 shadow-xl border border-white/40 bg-white/70 backdrop-blur">
              <div className="h-52 overflow-y-auto mb-4">
                {responseBody ? (
                  <div className="whitespace-pre-wrap">{loading ? <div className="text-gray-400">Regenerating...</div> : responseBody}</div>
                ) : (
                  <p className="text-gray-400">No response yet...</p>
                )}
              </div>
              <button
                onClick={handleCopy}
                disabled={!responseBody}
                className="w-full px-4 py-3 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-slate-600 to-slate-800 shadow hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <IconCopy />
                  Copy to Clipboard
                </span>
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
