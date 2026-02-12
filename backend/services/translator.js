import axios from 'axios';

const SUPPORTED_LANGUAGES = {
  'hi': 'Hindi',
  'bn': 'Bengali',
  'te': 'Telugu',
  'mr': 'Marathi',
  'ta': 'Tamil',
  'gu': 'Gujarati',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'pa': 'Punjabi'
};

export const translateText = async (text, targetLanguage) => {
  if (!SUPPORTED_LANGUAGES[targetLanguage]) {
    throw new Error('Unsupported language');
  }

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
            content: `You are a professional translator. Translate the following text to ${SUPPORTED_LANGUAGES[targetLanguage]}. Maintain the meaning and tone.`
          },
          {
            role: 'user',
            content: truncatedText
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    throw new Error(`Translation failed: ${error.response?.data?.error?.message || error.message}`);
  }
};

export { SUPPORTED_LANGUAGES };
