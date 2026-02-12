import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalText: { type: String, required: true },
  simplifiedText: { type: String },
  entities: {
    acts: [String],
    sections: [String],
    parties: [String],
    dates: [String],
    courts: [String]
  },
  translations: {
    type: Map,
    of: String
  },
  chunks: [{
    text: String,
    embedding: [Number]
  }],
  qaHistory: [{
    question: String,
    answer: String,
    sourceChunk: String,
    confidence: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  status: {
    uploaded: { type: Boolean, default: true },
    simplified: { type: Boolean, default: false },
    entitiesExtracted: { type: Boolean, default: false },
    translated: { type: Boolean, default: false },
    qaReady: { type: Boolean, default: false }
  }
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);
