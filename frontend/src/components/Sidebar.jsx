import { useEffect } from 'react';
import { useDocument } from '../context/DocumentContext';

export default function Sidebar({ onDocumentSelect }) {
  const { documents, loadDocuments, currentDocument } = useDocument();

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <div className="w-64 bg-gray-100 p-4 h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Documents</h2>
      
      {currentDocument && (
        <div className="mb-6 p-3 bg-white rounded shadow">
          <h3 className="font-semibold mb-2">Current Status</h3>
          <div className="space-y-1 text-sm">
            <StatusBadge label="Uploaded" status={currentDocument.status.uploaded} />
            <StatusBadge label="Simplified" status={currentDocument.status.simplified} />
            <StatusBadge label="Entities" status={currentDocument.status.entitiesExtracted} />
            <StatusBadge label="Translated" status={currentDocument.status.translated} />
            <StatusBadge label="Q&A Ready" status={currentDocument.status.qaReady} />
          </div>
        </div>
      )}

      <div className="space-y-2">
        {documents.map(doc => (
          <div
            key={doc._id}
            onClick={() => onDocumentSelect(doc._id)}
            className={`p-3 rounded cursor-pointer ${
              currentDocument?.id === doc._id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <p className="font-medium text-sm truncate">{doc.filename}</p>
            <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ label, status }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-gray-300'}`}></span>
      <span>{label}</span>
    </div>
  );
}
