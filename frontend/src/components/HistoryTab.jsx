import { useState, useEffect } from 'react';
import { useDocument } from '../context/DocumentContext';

export default function HistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const { loadHistory, loadHistoryItem, setCurrentDocument, saveHistory, currentDocument } = useDocument();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await loadHistory();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
    setLoading(false);
  };

  const handleLoadHistory = async (historyId) => {
    try {
      const historyData = await loadHistoryItem(historyId);
      setSelectedHistory(historyData);
      
      // Rehydrate the UI state
      setCurrentDocument({
        id: historyData.documentId,
        originalText: historyData.originalText,
        simplifiedText: historyData.simplifiedText,
        wordLimit: historyData.wordLimit,
        entities: historyData.entities,
        status: {
          uploaded: true,
          simplified: !!historyData.simplifiedText,
          entitiesExtracted: historyData.entities && (historyData.entities.acts?.length > 0 || historyData.entities.sections?.length > 0),
          translated: false,
          qaReady: false
        }
      });

      alert('History loaded! Check other tabs to see the data.');
    } catch (error) {
      alert('Failed to load history: ' + error.message);
    }
  };

  const handleSaveCurrentState = async () => {
    if (!currentDocument) {
      alert('No document to save');
      return;
    }

    try {
      await saveHistory({
        documentId: currentDocument.id,
        originalText: currentDocument.originalText,
        simplifiedText: currentDocument.simplifiedText,
        wordLimit: currentDocument.wordLimit || 100,
        entities: currentDocument.entities,
        qaSession: [],
        actionType: 'full_analysis'
      });

      alert('Current state saved to history!');
      fetchHistory();
    } catch (error) {
      alert('Failed to save history: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">History</h2>
        <button
          onClick={handleSaveCurrentState}
          disabled={!currentDocument}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          Save Current State
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* History List */}
        <div className="col-span-1">
          <h3 className="font-semibold mb-3">Saved Sessions</h3>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500 text-sm">No history yet</p>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white border rounded p-3 cursor-pointer hover:shadow-md transition ${
                    selectedHistory?._id === item._id ? 'border-blue-500 border-2' : ''
                  }`}
                  onClick={() => handleLoadHistory(item._id)}
                >
                  <div className="flex gap-2 items-center mb-1">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                      {item.actionType}
                    </span>
                    {item.wordLimit && (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                        {item.wordLimit}w
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{item.preview}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History Details */}
        <div className="col-span-2">
          {selectedHistory ? (
            <div className="bg-white border rounded p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Session Details</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedHistory.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">
                  {selectedHistory.actionType}
                </span>
              </div>

              {/* Q&A Session */}
              {selectedHistory.qaSession && selectedHistory.qaSession.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-purple-700">Q&A Session ({selectedHistory.qaSession.length} questions)</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedHistory.qaSession.map((qa, i) => (
                      <div key={i} className="border-l-4 border-purple-500 pl-3 py-2 bg-purple-50">
                        <p className="font-medium text-sm text-purple-900">Q{i + 1}: {qa.question}</p>
                        <p className="text-sm text-gray-700 mt-1">A: {qa.answer}</p>
                        {qa.confidence > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Confidence: {(qa.confidence * 100).toFixed(0)}%
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Simplified Text */}
              {selectedHistory.simplifiedText && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-green-700">
                    Simplified Text {selectedHistory.wordLimit && `(${selectedHistory.wordLimit} words)`}
                  </h4>
                  <div className="bg-green-50 p-3 rounded text-sm max-h-40 overflow-y-auto">
                    {selectedHistory.simplifiedText}
                  </div>
                </div>
              )}

              {/* Entities */}
              {selectedHistory.entities && (
                <div>
                  <h4 className="font-semibold mb-2 text-indigo-700">Extracted Entities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedHistory.entities.acts?.length > 0 && (
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs font-semibold text-blue-700">Acts ({selectedHistory.entities.acts.length})</p>
                        <p className="text-xs text-gray-600">{selectedHistory.entities.acts.slice(0, 2).join(', ')}</p>
                      </div>
                    )}
                    {selectedHistory.entities.sections?.length > 0 && (
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-xs font-semibold text-green-700">Sections ({selectedHistory.entities.sections.length})</p>
                        <p className="text-xs text-gray-600">{selectedHistory.entities.sections.slice(0, 2).join(', ')}</p>
                      </div>
                    )}
                    {selectedHistory.entities.parties?.length > 0 && (
                      <div className="bg-yellow-50 p-2 rounded">
                        <p className="text-xs font-semibold text-yellow-700">Parties ({selectedHistory.entities.parties.length})</p>
                        <p className="text-xs text-gray-600">{selectedHistory.entities.parties.slice(0, 2).join(', ')}</p>
                      </div>
                    )}
                    {selectedHistory.entities.dates?.length > 0 && (
                      <div className="bg-indigo-50 p-2 rounded">
                        <p className="text-xs font-semibold text-indigo-700">Dates ({selectedHistory.entities.dates.length})</p>
                        <p className="text-xs text-gray-600">{selectedHistory.entities.dates.slice(0, 2).join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed rounded p-8 text-center text-gray-500">
              <p>Select a history item to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
