import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Document from '../models/Document.js';
import { answerQuestion, answerMultipleQuestions } from '../services/qaService.js';

const router = express.Router();

// Single question
router.post('/:documentId/ask', authenticate, async (req, res) => {
  try {
    const { question } = req.body;
    const document = await Document.findOne({ _id: req.params.documentId, userId: req.userId });
    
    if (!document) return res.status(404).json({ error: 'Document not found' });
    if (!document.status.qaReady) return res.status(400).json({ error: 'Document not ready for Q&A' });

    const result = await answerQuestion(question, document.chunks);

    // Save to history
    document.qaHistory.push({
      question,
      answer: result.answer,
      sourceChunk: result.sourceChunk,
      confidence: result.confidence
    });
    await document.save();

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Multiple questions
router.post('/:documentId/ask-multiple', authenticate, async (req, res) => {
  try {
    const { questions } = req.body;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Questions must be a non-empty array' });
    }

    const document = await Document.findOne({ _id: req.params.documentId, userId: req.userId });
    
    if (!document) return res.status(404).json({ error: 'Document not found' });
    if (!document.status.qaReady) return res.status(400).json({ error: 'Document not ready for Q&A' });

    const results = await answerMultipleQuestions(questions, document.chunks);

    // Save all to history
    results.forEach(result => {
      document.qaHistory.push({
        question: result.question,
        answer: result.answer,
        sourceChunk: result.sourceChunk,
        confidence: result.confidence
      });
    });
    await document.save();

    res.json({ answers: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:documentId/history', authenticate, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.documentId, userId: req.userId });
    if (!document) return res.status(404).json({ error: 'Document not found' });

    res.json(document.qaHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
