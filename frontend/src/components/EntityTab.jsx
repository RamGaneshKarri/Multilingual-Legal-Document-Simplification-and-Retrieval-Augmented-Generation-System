import { useState } from 'react';
import { useDocument } from '../context/DocumentContext';

export default function EntityTab() {
  const [loading, setLoading] = useState(false);
  const { currentDocument, extractEntities } = useDocument();

  const handleExtract = async () => {
    setLoading(true);
    try {
      console.log('Document ID:', currentDocument?.id);
      
      if (!currentDocument?.id) {
        alert('No document ID found');
        setLoading(false);
        return;
      }
      
      const result = await extractEntities(currentDocument.id);
      console.log('Result:', result);
      
      const total = (result.entities.acts?.length || 0) + 
                    (result.entities.sections?.length || 0) + 
                    (result.entities.parties?.length || 0) + 
                    (result.entities.dates?.length || 0) + 
                    (result.entities.courts?.length || 0);
      
      alert(total === 0 ? 'No entities found' : `Extracted ${total} entities!`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed: ' + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  if (!currentDocument) {
    return <div className="p-6 text-gray-500">Please upload a document first</div>;
  }

  const labelColors = {
    'acts': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', itemBorder: 'border-blue-100' },
    'sections': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', itemBorder: 'border-green-100' },
    'parties': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', itemBorder: 'border-yellow-100' },
    'courts': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', itemBorder: 'border-red-100' },
    'dates': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', itemBorder: 'border-indigo-100' }
  };

  const hasEntities = currentDocument.entities && (
    (currentDocument.entities.acts && currentDocument.entities.acts.length > 0) ||
    (currentDocument.entities.sections && currentDocument.entities.sections.length > 0) ||
    (currentDocument.entities.parties && currentDocument.entities.parties.length > 0) ||
    (currentDocument.entities.dates && currentDocument.entities.dates.length > 0) ||
    (currentDocument.entities.courts && currentDocument.entities.courts.length > 0)
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Legal Entity Extraction</h2>
        <button
          onClick={handleExtract}
          disabled={loading}
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
        >
          {loading ? 'Extracting...' : 'Extract Entities'}
        </button>
      </div>

      {hasEntities ? (
        <div className="grid grid-cols-2 gap-4">
          <EntityGroup title="Acts & Laws" items={currentDocument.entities.acts} colors={labelColors.acts} />
          <EntityGroup title="Sections" items={currentDocument.entities.sections} colors={labelColors.sections} />
          <EntityGroup title="Parties" items={currentDocument.entities.parties} colors={labelColors.parties} />
          <EntityGroup title="Courts" items={currentDocument.entities.courts} colors={labelColors.courts} />
          <EntityGroup title="Dates" items={currentDocument.entities.dates} colors={labelColors.dates} />
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed rounded p-8 text-center">
          <p className="text-gray-500 mb-2">Click "Extract Entities" to identify legal terms</p>
          <p className="text-sm text-gray-400">The system will extract Acts, Sections, Parties, Courts, and Dates</p>
        </div>
      )}
    </div>
  );
}

function EntityGroup({ title, items, colors }) {
  return (
    <div className={`${colors.bg} p-4 rounded border ${colors.border}`}>
      <h3 className={`font-semibold mb-2 ${colors.text}`}>
        {title} {items && items.length > 0 && `(${items.length})`}
      </h3>
      {items && items.length > 0 ? (
        <ul className="space-y-1 max-h-60 overflow-y-auto">
          {items.map((item, i) => (
            <li key={i} className={`text-sm bg-white px-2 py-1 rounded border ${colors.itemBorder}`}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">None found</p>
      )}
    </div>
  );
}
