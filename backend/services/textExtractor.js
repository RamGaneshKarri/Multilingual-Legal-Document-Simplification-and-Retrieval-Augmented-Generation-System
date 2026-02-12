import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';

export const extractText = async (filePath, fileType) => {
  try {
    const buffer = await fs.readFile(filePath);
    
    if (fileType === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (fileType === 'text/plain') {
      return buffer.toString('utf-8');
    }
    
    throw new Error('Unsupported file type');
  } catch (error) {
    throw new Error(`Text extraction failed: ${error.message}`);
  }
};

export const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};
