import pdf from 'pdf-parse';
import Tesseract from 'tesseract.js';

export const extractTextFromPDF = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const data = await pdf(fileBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const extractTextFromImage = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const result = await Tesseract.recognize(
      fileBuffer,
      'eng',
      {
        logger: m => console.log(m)
      }
    );
    return result.data.text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to extract text from image');
  }
};

export const validateFileType = (mimetype: string): 'pdf' | 'image' | 'invalid' => {
  if (mimetype === 'application/pdf') {
    return 'pdf';
  }
  
  if (mimetype.startsWith('image/')) {
    return 'image';
  }
  
  return 'invalid';
}; 