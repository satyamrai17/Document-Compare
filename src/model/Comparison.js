//model/Comparison.js
import clientPromise from '../lib/mongodb';

const COLLECTION_NAME = 'comparisons';

export async function saveComparison(uploadedContent, standardContent, differences) {
  try {
    const client = await clientPromise;
    const db = client.db('document_compare');

    const result = await db.collection(COLLECTION_NAME).insertOne({
      uploadedContent,
      standardContent,
      differences,
      createdAt: new Date(),
    });

    return result.insertedId;
  } catch (error) {
    throw new Error('Failed to save comparison: ' + error.message);
  }
}

export async function getComparisonById(id) {
  try {
    const client = await clientPromise;
    const db = client.db('document_compare');
    const result = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });

    return result;
  } catch (error) {
    throw new Error('Failed to fetch comparison: ' + error.message);
  }
}




