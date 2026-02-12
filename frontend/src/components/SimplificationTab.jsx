import { useState } from 'react';
import { useDocument } from '../context/DocumentContext';
import { toast } from 'react-toastify';

export default function SimplificationTab() {
  const [loading, setLoading] = useState(false);
  const [wordLimit, setWordLimit] = useState(100);
  const [method, setMethod] = useState('hybrid'); // hybrid, legal-bert, local, groq
  const { currentDocument, simplifyDocument } = useDocument();

  const handleSimplify = async () => {
    setLoading(true);
    try {
      await simplifyDocument(currentDocument.id, wordLimit, method);
      toast.success('Document simplified successfully!');
    } catch (error) {
      toast.error('Simplification failed: ' + error.message);
    }
    setLoading(false);
  };

  if (!currentDocument) {
    return <div className="p-6 text-gray-500">Please upload a document first</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Simplification</h2>
        <div className="flex gap-3 items-center">
          <label className="font-medium">Method:</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="border rounded px-3 py-2 bg-blue-50"
          >
            <option value="hybrid">🔬 Legal-BERT + Groq (Hybrid)</option>
            <option value="legal-bert">⚖️ Legal-BERT Only</option>
            <option value="groq">⚡ Groq Only</option>
          </select>
          <label className="font-medium">Word Limit:</label>
          <select
            value={wordLimit}
            onChange={(e) => setWordLimit(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            <option value={50}>50 words</option>
            <option value={100}>100 words</option>
            <option value={200}>200 words</option>
            <option value={300}>300 words</option>
          </select>
          <button
            onClick={handleSimplify}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Simplifying...' : 'Simplify Document'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Original Text</h3>
          <div className="bg-gray-50 p-4 rounded border h-96 overflow-y-auto text-sm">
            {currentDocument.originalText}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-green-700">Simplified Text ({currentDocument.wordLimit || wordLimit} words)</h3>
          <div className="bg-green-50 p-4 rounded border h-96 overflow-y-auto text-sm">
            {currentDocument.simplifiedText || 'Click "Simplify Document" to generate simplified version'}
          </div>
        </div>
      </div>
    </div>
  );
}
