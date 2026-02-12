import { useState } from 'react';
import { useDocument } from '../context/DocumentContext';

const LANGUAGES = {
  hi: 'Hindi',
  bn: 'Bengali',
  te: 'Telugu',
  mr: 'Marathi',
  ta: 'Tamil',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi'
};

export default function TranslationTab() {
  const [selectedLang, setSelectedLang] = useState('hi');
  const [loading, setLoading] = useState(false);
  const { currentDocument, translateDocument } = useDocument();

  const handleTranslate = async () => {
    setLoading(true);
    try {
      await translateDocument(currentDocument.id, selectedLang);
    } catch (error) {
      alert('Translation failed: ' + error.message);
    }
    setLoading(false);
  };

  if (!currentDocument) {
    return <div className="p-6 text-gray-500">Please upload a document first</div>;
  }

  const currentTranslation = currentDocument.translations?.[selectedLang];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Multilingual Translation</h2>

      <div className="mb-4 flex gap-4 items-center">
        <label className="font-semibold">Select Language:</label>
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
        <button
          onClick={handleTranslate}
          disabled={loading || currentTranslation}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? 'Translating...' : currentTranslation ? 'Already Translated' : 'Translate'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2 text-gray-700">English (Simplified)</h3>
          <div className="bg-gray-50 p-4 rounded border h-96 overflow-y-auto text-sm">
            {currentDocument.simplifiedText || currentDocument.originalText}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-indigo-700">{LANGUAGES[selectedLang]}</h3>
          <div className="bg-indigo-50 p-4 rounded border h-96 overflow-y-auto text-sm">
            {currentTranslation || 'Click "Translate" to generate translation'}
          </div>
        </div>
      </div>
    </div>
  );
}
