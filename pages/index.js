// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [responseBody, setResponseBody] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate a full response
  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setResponseBody(''); // Clear previous response

    try {
      const res = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResponseBody(data.body);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setLoading(false);
    }
  };

  // Copy the entire generated response to the clipboard
  const handleCopy = () => {
    navigator.clipboard
      .writeText(responseBody)
      .then(() => alert('Copied to clipboard!'))
      .catch((err) => console.error('Failed to copy text: ', err));
  };

  // Submit on Enter (without Shift)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-4">EasyReply: Write Perfect Replies in Seconds</h1>
      <div className="grid grid-cols-2 gap-8 items-start">
        {/* Left Column: User Input */}
        <div>
          <h2 className="text-xl font-semibold mb-2">What email are you replying to?</h2>
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

        {/* Right Column: AI Output */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Generated Response:</h2>
          <div className="border border-gray-300 rounded p-4 bg-gray-50">
            <div className="h-52 overflow-y-auto mb-4">
              {responseBody ? (
                <div className="whitespace-pre-wrap">{responseBody}</div>
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
  );
}
