'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';
import Button from './Button';

const ApiDebugger: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>('Testing...');
  const [apiUrl, setApiUrl] = useState<string>('');

  useEffect(() => {
    setApiUrl(API_BASE_URL);
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/getusers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setApiStatus('✅ Connected successfully');
      } else {
        setApiStatus(`❌ Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setApiStatus(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <h3 className="font-bold text-sm mb-2">API Debugger</h3>
      <div className="text-xs space-y-1">
        <div><strong>API URL:</strong> {apiUrl}</div>
        <div><strong>Status:</strong> {apiStatus}</div>
        <Button 
          variant="secondary" 
          onClick={testApiConnection}
          className="mt-2 text-xs"
        >
          Test Connection
        </Button>
      </div>
    </div>
  );
};

export default ApiDebugger; 