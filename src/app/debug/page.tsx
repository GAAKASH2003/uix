'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import Cookies from 'js-cookie';

export default function DebugPage() {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkAuth = async () => {
      const info = {
        isAuthenticated: authService.isAuthenticated(),
        token: authService.getToken(),
        tokenLength: authService.getToken()?.length || 0,
        cookieToken: Cookies.get('auth_token'),
        cookieTokenLength: Cookies.get('auth_token')?.length || 0,
        user: user,
        loading: loading
      };
      setDebugInfo(info);
    };

    checkAuth();
  }, [user, loading]);

  const testMeEndpoint = async () => {
    try {
      const response = await authService.getCurrentUser();
      setDebugInfo(prev => ({ ...prev, meResponse: response }));
    } catch (error: any) {
      setDebugInfo(prev => ({ ...prev, meError: error.message }));
    }
  };

  const clearToken = () => {
    authService.logout();
    setDebugInfo(prev => ({ ...prev, cleared: true }));
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold font-mono">Authentication Debug</h1>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold font-mono">Debug Information:</h2>
        <pre className="bg-gray-100 p-4 rounded font-mono text-sm overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div className="space-y-2">
        <button 
          onClick={testMeEndpoint}
          className="bg-blue-500 text-white px-4 py-2 rounded font-mono"
        >
          Test /me Endpoint
        </button>
        
        <button 
          onClick={clearToken}
          className="bg-red-500 text-white px-4 py-2 rounded font-mono ml-2"
        >
          Clear Token
        </button>
      </div>
    </div>
  );
}
