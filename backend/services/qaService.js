import axios from 'axios';
import { generateEmbedding, cosineSimilarity } from './embeddingService.js';

export const answerQuestion = async (question, documentChunks) => {
  try {
    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);

    // Find most relevant chunks using cosine similarity
    const rankedChunks = documentChunks
      .map(chunk => ({
        text: chunk.text,
        similarity: cosineSimilarity(questionEmbedding, chunk.embedding)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3); // Top 3 most relevant chunks

    // If similarity is too low, return "not found"
    if (rankedChunks[0].similarity < 0.3) {
      return {
        answer: 'I could not find relevant information in the document to answer this question.',
        sourceChunk: null,
        confidence: 0,
        found: false
      };
    }

    // Combine top chunks as context
    const context = rankedChunks.map(c => c.text).join('\n\n');

    // Send to Groq with strict instructions
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a legal assistant. Answer ONLY based on the provided context. If the answer is not in the context, say "The document does not contain information to answer this question." Do not use external knowledge.'
          },
          {
            role: 'user',
            content: `Context from document:\n${context}\n\nQuestion: ${question}\n\nAnswer based ONLY on the context above:`
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      answer: response.data.choices[0].message.content,
      sourceChunk: rankedChunks[0].text,
      confidence: rankedChunks[0].similarity,
      found: true
    };
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    throw new Error(`QA failed: ${error.response?.data?.error?.message || error.message}`);
  }
};

export const answerMultipleQuestions = async (questions, documentChunks) => {
  const results = [];

  for (const question of questions) {
    try {
      const result = await answerQuestion(question, documentChunks);
      results.push({
        question,
        ...result
      });
    } catch (error) {
      results.push({
        question,
        answer: 'Error processing question',
        sourceChunk: null,
        confidence: 0,
        found: false,
        error: error.message
      });
    }
  }

  return results;
};
