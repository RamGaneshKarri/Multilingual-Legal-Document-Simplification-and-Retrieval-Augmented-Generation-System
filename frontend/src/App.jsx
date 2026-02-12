import { useState } from 'react';
import { DocumentProvider, useDocument } from './context/DocumentContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UploadTab from './components/UploadTab';
import SimplificationTab from './components/SimplificationTab';
import EntityTab from './components/EntityTab';
import TranslationTab from './components/TranslationTab';
import QATab from './components/QATab';
import HistoryTab from './components/HistoryTab';

function AppContent() {
  const [activeTab, setActiveTab] = useState('upload');
  const { token, login, signup, loadDocument } = useDocument();
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        await login(formData.email, formData.password);
        toast.success('Login successful!');
      } else {
        await signup(formData.email, formData.password, formData.name);
        toast.success('Account created successfully!');
      }
    } catch (error) {
      toast.error('Authentication failed: ' + error.message);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-96">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Legal AI System</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-4 py-2"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border rounded px-4 py-2"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border rounded px-4 py-2"
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <p className="text-center mt-4 text-sm">
            {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-blue-600 underline"
            >
              {authMode === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'upload', label: 'Upload', component: UploadTab },
    { id: 'simplify', label: 'Simplification', component: SimplificationTab },
    { id: 'entities', label: 'Entities', component: EntityTab },
    { id: 'translate', label: 'Translation', component: TranslationTab },
    { id: 'qa', label: 'Q&A', component: QATab },
    { id: 'history', label: 'History', component: HistoryTab }
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar onDocumentSelect={loadDocument} />
        <div className="flex-1">
          <div className="border-b bg-white">
            <div className="flex">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white min-h-screen">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DocumentProvider>
      <AppContent />
      <ToastContainer position="top-right" autoClose={3000} />
    </DocumentProvider>
  );
}
