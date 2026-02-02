import { useState, useCallback } from 'react';

export const useChatStream = (sessionId, provider) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (message, onChunk, onComplete) => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = 'http://localhost:8000/chat';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          provider,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      
      onComplete?.(data);

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, provider]);

  return { sendMessage, isLoading, error };
};