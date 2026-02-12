import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const DocumentContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const DocumentProvider = ({ children }) => {
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const signup = async (email, password, name) => {
    const { data } = await axios.post(`${API_URL}/auth/signup`, { email, password, name });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCurrentDocument(null);
    localStorage.clear();
  };

  const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append('document', file);
    const { data } = await axios.post(`${API_URL}/documents/upload`, formData, axiosConfig);
    await loadDocument(data.documentId);
    return data.documentId;
  };

  const loadDocument = async (id) => {
    const { data } = await axios.get(`${API_URL}/documents/${id}`, axiosConfig);
    setCurrentDocument(data);
  };

  const loadDocuments = async () => {
    const { data } = await axios.get(`${API_URL}/documents`, axiosConfig);
    setDocuments(data);
  };

  const simplifyDocument = async (id, wordLimit = 100, method = 'hybrid') => {
    const { data } = await axios.post(`${API_URL}/documents/${id}/simplify`, { wordLimit, method }, axiosConfig);
    setCurrentDocument(prev => ({ ...prev, simplifiedText: data.simplifiedText, wordLimit: data.wordLimit, status: { ...prev.status, simplified: true } }));
    return data;
  };

  const extractEntities = async (id) => {
    try {
      console.log('=== FRONTEND: Starting entity extraction ===');
      console.log('Document ID:', id);
      console.log('API URL:', `${API_URL}/documents/${id}/entities`);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Current document:', currentDocument);
      
      const response = await axios.post(
        `${API_URL}/documents/${id}/entities`, 
        {}, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('=== FRONTEND: Response received ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.log('Entities:', response.data.entities);
      
      setCurrentDocument(prev => ({ 
        ...prev, 
        entities: response.data.entities, 
        status: { ...prev.status, entitiesExtracted: true } 
      }));
      
      return response.data;
    } catch (error) {
      console.error('=== FRONTEND: Entity extraction error ===');
      console.error('Error:', error);
      console.error('Response:', error.response);
      console.error('Message:', error.message);
      throw error;
    }
  };

  const translateDocument = async (id, language) => {
    const { data } = await axios.post(`${API_URL}/documents/${id}/translate`, { language }, axiosConfig);
    setCurrentDocument(prev => ({
      ...prev,
      translations: { ...prev.translations, [language]: data.translation },
      status: { ...prev.status, translated: true }
    }));
    return data;
  };

  const prepareQA = async (id) => {
    await axios.post(`${API_URL}/documents/${id}/prepare-qa`, {}, axiosConfig);
    setCurrentDocument(prev => ({ ...prev, status: { ...prev.status, qaReady: true } }));
  };

  const askQuestion = async (documentId, question) => {
    const { data } = await axios.post(`${API_URL}/qa/${documentId}/ask`, { question }, axiosConfig);
    return data;
  };

  const askMultipleQuestions = async (documentId, questions) => {
    const { data } = await axios.post(`${API_URL}/qa/${documentId}/ask-multiple`, { questions }, axiosConfig);
    return data;
  };

  const saveHistory = async (historyData) => {
    const { data } = await axios.post(`${API_URL}/history/save`, historyData, axiosConfig);
    return data;
  };

  const loadHistory = async () => {
    const { data } = await axios.get(`${API_URL}/history/list`, axiosConfig);
    return data;
  };

  const loadHistoryItem = async (historyId) => {
    const { data } = await axios.get(`${API_URL}/history/${historyId}`, axiosConfig);
    return data;
  };

  return (
    <DocumentContext.Provider value={{
      currentDocument,
      documents,
      user,
      token,
      login,
      signup,
      logout,
      uploadDocument,
      loadDocument,
      loadDocuments,
      simplifyDocument,
      extractEntities,
      translateDocument,
      prepareQA,
      askQuestion,
      askMultipleQuestions,
      saveHistory,
      loadHistory,
      loadHistoryItem,
      setCurrentDocument
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => useContext(DocumentContext);
