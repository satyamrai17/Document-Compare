
'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [differences, setDifferences] = useState([]);
  const [resultId, setResultId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a file.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('uploadedFile', file);

    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      setDifferences(data.differences);
      setResultId(data.resultId);
    } else {
      alert(data.error || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        Document Comparison Tool
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg"
      >
        <label className="block text-lg font-medium text-gray-700 mb-2">
          Upload Only Doc File
        </label>
        <input
          type="file"
          accept=".doc,.docx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-6"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 text-white font-bold rounded-lg transition-all ${
            loading
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 focus:ring focus:ring-blue-300'
          }`}
        >
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </form>

      {differences.length > 0 && (
        <div className="mt-8 w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Comparison Results
          </h2>
          <div className="border-t border-gray-300 pt-4">
            <h3 className="text-green-600 font-semibold mb-2">Matching Data</h3>
            <h3 className="text-red-600 font-semibold mb-2">Your File Data</h3>
            <h3 className="text-gray-600 font-semibold mb-4">Standard Data</h3>
            <ul className="space-y-2">
              {differences.map((diff, index) => (
                <li
                  key={index}
                  className={`py-2 px-4 rounded-lg ${
                    diff[0] === 1
                      ? 'bg-red-100 text-red-700'
                      : diff[0] === -1
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {diff[1]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
