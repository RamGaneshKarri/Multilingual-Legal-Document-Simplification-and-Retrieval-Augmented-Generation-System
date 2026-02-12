import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  
  // Original data
  originalText: { type: String, required: true },
  
  // Simplification data
  simplifiedText: { type: String },
  wordLimit: { type: Number, default: 100 },
  
  // Entity extraction data
  entities: [{
    text: String,
    label: String,
    start: Number,
    end: Number
  }],
  
  // Q&A session data
  qaSession: [{
    question: String,
    answer: String,
    confidence: Number,
    sourceChunk: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Metadata
  actionType: { 
    type: String, 
    enum: ['simplification', 'entity_extraction', 'qa', 'full_analysis'],
    default: 'full_analysis'
  },
  
  // Preview for UI
  preview: { type: String, maxlength: 200 }
}, { 
  timestamps: true,
  collection: 'history'
});

// Indexes for performance
historySchema.index({ userId: 1, createdAt: -1 });
historySchema.index({ documentId: 1 });

// Generate preview before saving
historySchema.pre('save', function(next) {
  if (!this.preview && this.originalText) {
    this.preview = this.originalText.substring(0, 200) + '...';
  }
  next();
});

export default mongoose.model('History', historySchema);
