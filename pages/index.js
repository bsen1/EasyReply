// pages/index.js
import { useState, useRef, useEffect } from 'react';

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
          className="w-full px-3 py-2 border border-gray-300 bg-white rounded flex justify-between items-center focus:outline-none"
        >
          <span>{value || 'Select...'}</span>
          <span className="ml-2">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <ul className="absolute left-0 right-0 mt-1 border border-gray-300 bg-white rounded shadow z-10">
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
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-4">
        EasyReply: Write Perfect Replies in Seconds
      </h1>
      
      {/* 
        Layout:
        - On small screens: 1 column (stack vertically).
        - On md+ screens: 3 columns.
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Customization and Fine Tuning Options */}
        <div className="bg-white border border-gray-300 rounded p-4">
          {/* Customize Your Response */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Customize Your Response (Optional)</h2>
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
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Points to Include:</label>
              <input
                type="text"
                value={pointsToInclude}
                onChange={(e) => setPointsToInclude(e.target.value)}
                placeholder="Make sure to include..."
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          {/* Fine Tuning Options */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Fine Tuning Options
              {!responseBody && (<span className="text-sm font-normal"> (Generate a Response First)</span>)}
            </h2>
            <div className="flex space-x-2">
              <button
                type="button"
                disabled={!responseBody}
                onClick={() => handleRegenerate("shorter")}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Shorter
              </button>
              <button
                type="button"
                disabled={!responseBody}
                onClick={() => handleRegenerate("longer")}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Longer
              </button>
            </div>
            {/* Creativity Fine Tuning Option */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Creativity</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const newTemp = Number(Math.max(0, temperature - 0.2).toFixed(1));
                    setTemperature(newTemp);
                    handleRegenerate("temperature");
                  }}
                  disabled={!responseBody || temperature <= 0}
                  className="px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  –
                </button>
                {/* Display creativity as a percentage */}
                <span className="w-12 text-center">{Math.round((temperature / 2) * 100)}%</span>
                <button
                  type="button"
                  onClick={() => {
                    const newTemp = Number(Math.min(2, temperature + 0.2).toFixed(1));
                    setTemperature(newTemp);
                    handleRegenerate("temperature");
                  }}
                  disabled={!responseBody || temperature >= 2}
                  className="px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Email and Generated Response */}
        <div className="md:col-span-2 flex flex-col">
          {/* Email Input */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              What email are you replying to?
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="border border-gray-300 rounded p-4 bg-white">
                <textarea
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste your email here... (Press Enter to submit, Shift+Enter for a new line)"
                  className="w-full h-52 mb-4 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition-colors"
                >
                  {loading ? 'Generating...' : 'Generate Response'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Generated Response */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Generated Response:</h2>
            <div className="border border-gray-300 rounded p-4 bg-gray-50">
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
                className="w-full px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50 hover:bg-gray-600 transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
