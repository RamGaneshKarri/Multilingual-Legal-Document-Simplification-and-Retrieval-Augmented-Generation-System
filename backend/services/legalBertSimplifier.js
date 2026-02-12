import axios from 'axios';

/**
 * INDIAN LEGAL SIMPLIFICATION PROMPT
 */
const INDIAN_LEGAL_PROMPT = `You are a legal assistant specialized in Indian laws.
Your task is to rewrite the following legal text into simple, common-language English that any ordinary citizen can understand.

Rules:
- Do NOT use legal jargon
- Keep sentences short and clear
- Explain legal terms in plain words
- Preserve the original legal meaning
- Mention penalties or obligations clearly
- Do NOT add new information
- Do NOT remove important conditions`;

/**
 * METHOD 1: LEGAL-AWARE (Best for Indian Legal Documents)
 * Uses Indian legal simplification prompt
 */
export const simplifyHybrid = async (text, wordLimit = 100) => {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    console.log('🔬 LEGAL-AWARE METHOD (Indian Legal Prompt)');
    console.log('API Key:', GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 10)}...` : 'MISSING');
    
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: INDIAN_LEGAL_PROMPT
          },
          {
            role: 'user',
            content: `Legal Text:\n${text.substring(0, 3000)}\n\nSimplify in approximately ${wordLimit} words:`
          }
        ],
        temperature: 0.2,
        max_tokens: wordLimit * 3
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let simplified = response.data.choices[0].message.content.trim();
    const words = simplified.split(/\s+/).filter(w => w.length > 0);
    if (words.length > wordLimit) {
      simplified = words.slice(0, wordLimit).join(' ');
    }

    console.log(`✅ LEGAL-AWARE: ${words.length}/${wordLimit} words`);
    return simplified;
    
  } catch (error) {
    console.error('Full error:', error.response?.data || error.message);
    throw new Error(`Legal-aware method failed: ${error.message}`);
  }
};

/**
 * METHOD 2: TERM-PRESERVING (Keeps legal terminology)
 * Simplifies structure but preserves legal terms
 */
export const simplifyWithLegalBERT = async (text, wordLimit = 100) => {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    console.log('⚖️ TERM-PRESERVING METHOD');
    
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `${INDIAN_LEGAL_PROMPT}\n\nADDITIONAL RULE: You MUST preserve important legal terms like "culpable homicide", "tort", "plaintiff", "defendant", section numbers (Section 304), and act names (Indian Penal Code). Only simplify the sentence structure and grammar.`
          },
          {
            role: 'user',
            content: `Legal Text:\n${text.substring(0, 3000)}\n\nSimplify structure while keeping legal terms in approximately ${wordLimit} words:`
          }
        ],
        temperature: 0.1,
        max_tokens: wordLimit * 3
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let simplified = response.data.choices[0].message.content.trim();
    const words = simplified.split(/\s+/).filter(w => w.length > 0);
    if (words.length > wordLimit) {
      simplified = words.slice(0, wordLimit).join(' ');
    }

    console.log(`✅ TERM-PRESERVING: ${words.length}/${wordLimit} words`);
    return simplified;
    
  } catch (error) {
    throw new Error(`Term-preserving method failed: ${error.message}`);
  }
};

/**
 * METHOD 3: GENERIC (Baseline - replaces all legal terms)
 * Standard simplification without legal awareness
 */
export const simplifyWithGroq = async (text, wordLimit = 100) => {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    console.log('⚡ GENERIC METHOD (Baseline)');
    
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Simplify legal text to plain English. Replace ALL complex legal terms with simple everyday words. Make it easy for anyone to understand. Use short sentences.`
          },
          {
            role: 'user',
            content: `Simplify in approximately ${wordLimit} words:\n\n${text.substring(0, 3000)}`
          }
        ],
        temperature: 0.2,
        max_tokens: wordLimit * 3
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let simplified = response.data.choices[0].message.content.trim();
    const words = simplified.split(/\s+/).filter(w => w.length > 0);
    if (words.length > wordLimit) {
      simplified = words.slice(0, wordLimit).join(' ');
    }

    console.log(`✅ GENERIC: ${words.length}/${wordLimit} words`);
    return simplified;
    
  } catch (error) {
    throw new Error(`Generic method failed: ${error.message}`);
  }
};

/**
 * Main router
 */
export const simplifyLegalText = async (text, wordLimit = 100, method = 'hybrid') => {
  console.log(`\n========== ${method.toUpperCase()} METHOD ==========`);
  
  try {
    switch (method) {
      case 'hybrid':
        return await simplifyHybrid(text, wordLimit);
      
      case 'legal-bert':
        return await simplifyWithLegalBERT(text, wordLimit);
      
      case 'groq':
        return await simplifyWithGroq(text, wordLimit);
      
      default:
        return await simplifyHybrid(text, wordLimit);
    }
  } catch (error) {
    console.error(`❌ ${method} failed:`, error.message);
    throw error;
  }
};
