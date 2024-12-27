
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import DiffMatchPatch from 'diff-match-patch';
import mammoth from 'mammoth'; // Library for extracting text from DOC/DOCX
import { saveComparison } from '@/model/Comparison';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('uploadedFile');

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  try {
    // Ensure uploaded file is a DOC/DOCX
    const extension = path.extname(file.name).toLowerCase();
    if (extension !== '.doc' && extension !== '.docx') {
      throw new Error('Only .doc or .docx files are supported.');
    }

    // Save uploaded file temporarily
    const uploadedFilePath = path.join('./uploads', file.name);
    fs.writeFileSync(uploadedFilePath, Buffer.from(await file.arrayBuffer()));

    // Extract text from uploaded DOC/DOCX file
    const uploadedContent = await extractTextFromDOC(uploadedFilePath);

    // Extract text from the standard DOC/DOCX file
    const standardFilePath = path.join(process.cwd(), 'standard.docx');
    const standardContent = await extractTextFromDOC(standardFilePath);

    // Compare documents
    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(standardContent, uploadedContent);
    dmp.diff_cleanupSemantic(diffs);

    // Save the comparison result in MongoDB
    const resultId = await saveComparison(uploadedContent, standardContent, diffs);

    // Clean up uploaded file
    fs.unlinkSync(uploadedFilePath);

    // Return the differences and result ID
    return NextResponse.json({ differences: diffs, resultId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper: Extract text from DOC/DOCX
async function extractTextFromDOC(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const { value: text } = await mammoth.extractRawText({ buffer: fileBuffer });
  return text; // Extracted text from DOC/DOCX
}
