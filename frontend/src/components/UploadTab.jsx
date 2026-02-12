import { useState } from 'react';
import { useDocument } from '../context/DocumentContext';
import { toast } from 'react-toastify';

export default function UploadTab() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { uploadDocument, currentDocument, setCurrentDocument } = useDocument();

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await uploadDocument(file);
      toast.success('Document uploaded successfully!');
      setFile(null);
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Upload Document</h2>
        {currentDocument && (
          <button
            onClick={() => setCurrentDocument(null)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
          >
            <span className="text-xl">+</span> New Upload
          </button>
        )}
      </div>
      
      {!currentDocument ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4"
          />
          {file && <p className="mb-4 text-sm text-gray-600">Selected: {file.name}</p>}
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2">Document Information</h3>
          <p><strong>Filename:</strong> {currentDocument.filename}</p>
          <p><strong>Uploaded:</strong> {new Date(currentDocument.createdAt).toLocaleString()}</p>
          <p className="mt-4 text-sm text-gray-600">
            <strong>Preview:</strong> {currentDocument.originalText.substring(0, 300)}...
          </p>
        </div>
      )}
    </div>
  );
}
