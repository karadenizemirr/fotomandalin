"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function S3ImageTestPage() {
  const [testResults, setTestResults] = useState<any>({});

  // Test URL'leri
  const testUrls = [
    'https://fotomandalin.s3.eu-north-1.amazonaws.com/uploads/test.jpg',
    'https://accessfotomandalin-668567157984.s3-accesspoint.eu-north-1.amazonaws.com/uploads/test.jpg',
    '/uploads/test.jpg', // Rewrite test
  ];

  const testImageLoad = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        url,
        status: response.status,
        accessible: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      return {
        url,
        status: 'ERROR',
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runTests = async () => {
    const results: any = {};

    for (const url of testUrls) {
      results[url] = await testImageLoad(url);
    }

    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          S3 Image Loading Test
        </h1>

        {/* Test Button */}
        <button
          onClick={runTests}
          className="mb-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Run S3 Tests
        </button>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2 text-sm font-mono">
            <div>AWS_S3_BUCKET_URL: {process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL || 'Not set'}</div>
            <div>AWS_REGION: {process.env.NEXT_PUBLIC_AWS_REGION || 'Not set'}</div>
            <div>AWS_S3_BUCKET_NAME: {process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME || 'Not set'}</div>
          </div>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-white rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-4">
              {Object.entries(testResults).map(([url, result]: [string, any]) => (
                <div key={url} className="border border-gray-200 rounded p-4">
                  <div className="font-mono text-sm mb-2">{url}</div>
                  <div className={`inline-block px-2 py-1 rounded text-xs ${
                    result.accessible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    Status: {result.status} - {result.accessible ? 'Accessible' : 'Not Accessible'}
                  </div>
                  {result.error && (
                    <div className="text-red-600 text-sm mt-2">Error: {result.error}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Direct img tag test */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Direct IMG Tag Test</h3>
            <div className="space-y-4">
              {testUrls.map((url) => (
                <div key={`img-${url}`} className="border border-gray-200 rounded p-4">
                  <div className="text-sm font-mono mb-2">{url}</div>
                  <img
                    src={url}
                    alt="Test"
                    className="w-32 h-32 object-cover border"
                    onLoad={() => console.log(`IMG loaded: ${url}`)}
                    onError={(e) => {
                      console.log(`IMG failed: ${url}`);
                      e.currentTarget.style.border = '2px solid red';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Next.js Image test */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Next.js Image Test</h3>
            <div className="space-y-4">
              {testUrls.map((url) => (
                <div key={`next-${url}`} className="border border-gray-200 rounded p-4">
                  <div className="text-sm font-mono mb-2">{url}</div>
                  <div className="relative w-32 h-32 border">
                    <Image
                      src={url}
                      alt="Test"
                      fill
                      className="object-cover"
                      unoptimized={url.includes('amazonaws.com')}
                      onLoad={() => console.log(`Next.js Image loaded: ${url}`)}
                      onError={(e) => {
                        console.log(`Next.js Image failed: ${url}`);
                        e.currentTarget.style.border = '2px solid red';
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Browser Console Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Instructions</h3>
          <p className="text-yellow-700 text-sm">
            1. Open browser console (F12)<br/>
            2. Run tests above<br/>
            3. Check console for loading messages<br/>
            4. Check Network tab for failed requests<br/>
            5. Look for CORS errors or 403/404 responses
          </p>
        </div>
      </div>
    </div>
  );
}
