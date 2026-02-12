import axios from 'axios';

export const simplifyLegalText = async (text, wordLimit = 100) => {
  try {
    // Truncate text if too long
    const truncatedText = text.length > 3000 ? text.substring(0, 3000) + '...' : text;
    
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a legal text simplifier. You MUST respond with EXACTLY ${wordLimit} words, no more, no less. Count carefully. Simplify complex legal language to plain English while preserving key information.`
          },
          {
            role: 'user',
            content: `Simplify this legal text in EXACTLY ${wordLimit} words:\n\n${truncatedText}\n\nRemember: Your response must be EXACTLY ${wordLimit} words. Count each word carefully.`
          }
        ],
        temperature: 0.2,
        max_tokens: Math.min(wordLimit * 3, 2000)
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let simplified = response.data.choices[0].message.content.trim();
    
    // STRICT word limit enforcement
    const words = simplified.split(/\s+/).filter(w => w.length > 0);
    
    if (words.length > wordLimit) {
      // Cut to exact word limit
      simplified = words.slice(0, wordLimit).join(' ');
    } else if (words.length < wordLimit) {
      // If under limit, that's acceptable (better than over)
      simplified = words.join(' ');
    }

    console.log(`Word count: ${words.length}/${wordLimit}`);
    return simplified;
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    throw new Error(`Simplification failed: ${error.response?.data?.error?.message || error.message}`);
  }
};
