import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.js';
import Document from '../models/Document.js';
import { extractText, cleanText } from '../services/textExtractor.js';
import { simplifyLegalText as simplifyGroq } from '../services/simplifier.js';
import { simplifyLegalText as simplifyLegalBERT } from '../services/legalBertSimplifier.js';
import { extractLegalEntities } from '../services/nerExtractor_simple.js';
import { translateText, SUPPORTED_LANGUAGES } from '../services/translator.js';
import { chunkText, generateEmbedding } from '../services/embeddingService.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload document
router.post('/upload', authenticate, upload.single('document'), async (req, res) => {
  try {
    const rawText = await extractText(req.file.path, req.file.mimetype);
    const cleanedText = cleanText(rawText);

    const document = new Document({
      userId: req.userId,
      filename: req.file.originalname,
      originalText: cleanedText,
      status: { uploaded: true }
    });

    await document.save();
    res.json({ documentId: document._id, message: 'Document uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simplify document
router.post('/:id/simplify', authenticate, async (req, res) => {
  try {
    const { wordLimit = 100, method = 'hybrid' } = req.body; // method: 'hybrid', 'legal-bert', 'local', 'groq'
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!document) return res.status(404).json({ error: 'Document not found' });

    console.log(`Simplifying with method: ${method}`);
    
    let simplified;
    if (method === 'groq') {
      simplified = await simplifyGroq(document.originalText, wordLimit);
    } else {
      // Use Legal-BERT based methods (hybrid, legal-bert, local)
      simplified = await simplifyLegalBERT(document.originalText, wordLimit, method);
    }
    
    document.simplifiedText = simplified;
    document.wordLimit = wordLimit;
    document.status.simplified = true;
    await document.save();

    res.json({ simplifiedText: simplified, wordLimit, method });
  } catch (error) {
    console.error('Simplification error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Extract entities
router.post('/:id/entities', authenticate, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!document) return res.status(404).json({ error: 'Document not found' });

    console.log('\n=== ENTITY EXTRACTION START ===');
    console.log('Document ID:', document._id);
    console.log('Text length:', document.originalText?.length || 0);
    console.log('Text exists:', !!document.originalText);
    console.log('First 500 chars:', document.originalText?.substring(0, 500) || 'NO TEXT');

    if (!document.originalText || document.originalText.trim().length === 0) {
      console.log('ERROR: No text in document!');
      return res.json({ entities: { acts: [], sections: [], parties: [], dates: [], courts: [] } });
    }

    const entities = extractLegalEntities(document.originalText);
    
    console.log('\n=== EXTRACTION RESULT ===');
    console.log('Acts:', entities.acts);
    console.log('Sections:', entities.sections);
    console.log('Parties:', entities.parties);
    console.log('Dates:', entities.dates);
    console.log('Courts:', entities.courts);
    console.log('=== END ===\n');

    document.entities = entities;
    document.status.entitiesExtracted = true;
    await document.save();

    res.json({ entities });
  } catch (error) {
    console.error('Entity extraction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Translate document
router.post('/:id/translate', authenticate, async (req, res) => {
  try {
    const { language } = req.body;
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!document) return res.status(404).json({ error: 'Document not found' });

    if (!document.translations) document.translations = new Map();
    
    if (document.translations.get(language)) {
      return res.json({ translation: document.translations.get(language) });
    }

    const textToTranslate = document.simplifiedText || document.originalText;
    const translated = await translateText(textToTranslate, language);
    
    document.translations.set(language, translated);
    document.status.translated = true;
    await document.save();

    res.json({ translation: translated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Prepare for Q&A (generate embeddings)
router.post('/:id/prepare-qa', authenticate, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!document) return res.status(404).json({ error: 'Document not found' });

    const chunks = chunkText(document.originalText);
    const chunksWithEmbeddings = [];

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      chunksWithEmbeddings.push({ text: chunk, embedding });
    }

    document.chunks = chunksWithEmbeddings;
    document.status.qaReady = true;
    await document.save();

    res.json({ message: 'Document ready for Q&A', chunkCount: chunks.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get document details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!document) return res.status(404).json({ error: 'Document not found' });

    res.json({
      id: document._id,
      filename: document.filename,
      originalText: document.originalText,
      simplifiedText: document.simplifiedText,
      entities: document.entities,
      translations: Object.fromEntries(document.translations || new Map()),
      status: document.status,
      createdAt: document.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all documents for user
router.get('/', authenticate, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId })
      .select('filename status createdAt')
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
