import { useState } from 'react';
import { useDocument } from '../context/DocumentContext';

export default function QATab() {
  const [questions, setQuestions] = useState(['']);
  const [qaHistory, setQaHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const { currentDocument, prepareQA, askMultipleQuestions, saveHistory } = useDocument();

  const handlePrepare = async () => {
    setPreparing(true);
    try {
      await prepareQA(currentDocument.id);
      alert('Document ready for Q&A!');
    } catch (error) {
      alert('Preparation failed: ' + error.message);
    }
    setPreparing(false);
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleAskAll = async () => {
    const validQuestions = questions.filter(q => q.trim());
    if (validQuestions.length === 0) return;

    setLoading(true);
    try {
      const { answers } = await askMultipleQuestions(currentDocument.id, validQuestions);
      const newQaHistory = [...qaHistory, ...answers];
      setQaHistory(newQaHistory);
      setQuestions(['']);

      // Auto-save to history
      await saveHistory({
        documentId: currentDocument.id,
        originalText: currentDocument.originalText,
        simplifiedText: currentDocument.simplifiedText,
        wordLimit: currentDocument.wordLimit || 100,
        entities: currentDocument.entities,
        qaSession: newQaHistory,
        actionType: 'qa'
      });
    } catch (error) {
      alert('Questions failed: ' + error.message);
    }
    setLoading(false);
  };

  if (!currentDocument) {
    return <div className="p-6 text-gray-500">Please upload a document first</div>;
  }

  if (!currentDocument.status.qaReady) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Question & Answer</h2>
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded text-center">
          <p className="mb-4">Document needs to be prepared for Q&A (this generates embeddings)</p>
          <button
            onClick={handlePrepare}
            disabled={preparing}
            className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700 disabled:bg-gray-400"
          >
            {preparing ? 'Preparing...' : 'Prepare for Q&A'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Question & Answer (Multi-Question Support)</h2>

      <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded text-sm">
        <strong>Note:</strong> Answers are generated ONLY from the uploaded document. Q&A sessions are automatically saved to history.
      </div>

      {/* Question Input Area */}
      <div className="mb-4 bg-white border rounded p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Your Questions</h3>
          <button
            onClick={addQuestion}
            className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600"
          >
            + Add Question
          </button>
        </div>
        
        {questions.map((question, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={question}
              onChange={(e) => updateQuestion(index, e.target.value)}
              placeholder={`Question ${index + 1}...`}
              className="flex-1 border rounded px-4 py-2"
            />
            {questions.length > 1 && (
              <button
                onClick={() => removeQuestion(index)}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          onClick={handleAskAll}
          disabled={loading || questions.every(q => !q.trim())}
          className="mt-3 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 w-full"
        >
          {loading ? 'Processing...' : `Ask ${questions.filter(q => q.trim()).length} Question(s)`}
        </button>
      </div>

      {/* Answers Display */}
      <div className="bg-white border rounded p-4 max-h-96 overflow-y-auto">
        {qaHistory.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No questions asked yet</p>
        ) : (
          <div className="space-y-4">
            {qaHistory.map((qa, i) => (
              <QAItem key={i} qa={qa} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QAItem({ qa, index }) {
  const [showSource, setShowSource] = useState(false);

  return (
    <div className="border-l-4 border-blue-500 pl-4 pb-3">
      <p className="font-semibold text-blue-700">Q{index + 1}: {qa.question}</p>
      <p className="mt-2 text-gray-800">A: {qa.answer}</p>
      
      <div className="mt-2 flex gap-2 items-center text-sm">
        {qa.found ? (
          <>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">✓ Found in document</span>
            <span className="text-gray-500">Confidence: {(qa.confidence * 100).toFixed(0)}%</span>
            {qa.sourceChunk && (
              <button
                onClick={() => setShowSource(!showSource)}
                className="text-blue-600 underline"
              >
                {showSource ? 'Hide' : 'Show'} source
              </button>
            )}
          </>
        ) : (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded">✗ Not found in document</span>
        )}
      </div>

      {showSource && qa.sourceChunk && (
        <div className="mt-2 bg-gray-50 p-3 rounded text-sm border">
          <strong>Source paragraph:</strong>
          <p className="mt-1 text-gray-700">{qa.sourceChunk}</p>
        </div>
      )}
    </div>
  );
}
