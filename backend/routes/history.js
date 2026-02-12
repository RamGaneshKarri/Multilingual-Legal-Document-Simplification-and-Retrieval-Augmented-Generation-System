import express from 'express';
import { authenticate } from '../middleware/auth.js';
import History from '../models/History.js';

const router = express.Router();

// Save history entry
router.post('/save', authenticate, async (req, res) => {
  try {
    const { 
      documentId, 
      originalText, 
      simplifiedText, 
      wordLimit, 
      entities, 
      qaSession,
      actionType 
    } = req.body;

    const history = new History({
      userId: req.userId,
      documentId,
      originalText,
      simplifiedText,
      wordLimit,
      entities,
      qaSession,
      actionType
    });

    await history.save();
    res.status(201).json({ historyId: history._id, message: 'History saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all history for user
router.get('/list', authenticate, async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    
    const history = await History.find({ userId: req.userId })
      .select('preview actionType wordLimit createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await History.countDocuments({ userId: req.userId });

    res.json({ history, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific history entry
router.get('/:historyId', authenticate, async (req, res) => {
  try {
    const history = await History.findOne({ 
      _id: req.params.historyId, 
      userId: req.userId 
    });

    if (!history) {
      return res.status(404).json({ error: 'History not found' });
    }

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete history entry
router.delete('/:historyId', authenticate, async (req, res) => {
  try {
    await History.deleteOne({ 
      _id: req.params.historyId, 
      userId: req.userId 
    });

    res.json({ message: 'History deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
