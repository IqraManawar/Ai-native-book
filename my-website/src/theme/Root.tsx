import React, { useState, useCallback } from 'react';
import ChatWidget from '@site/src/components/ChatWidget';
import TextSelector from '@site/src/components/TextSelector';

interface RootProps {
  children: React.ReactNode;
}

// Default implementation - wraps the entire app
// Manages shared state between TextSelector and ChatWidget
export default function Root({ children }: RootProps): JSX.Element {
  const [selectedContext, setSelectedContext] = useState<string | undefined>(undefined);

  // Handle text selection from TextSelector
  const handleTextSelected = useCallback((text: string) => {
    setSelectedContext(text);
  }, []);

  // Clear context after it's been used by ChatWidget
  const handleContextUsed = useCallback(() => {
    setSelectedContext(undefined);
  }, []);

  return (
    <>
      {children}
      <TextSelector onTextSelected={handleTextSelected} />
      <ChatWidget
        selectedContext={selectedContext}
        onContextUsed={handleContextUsed}
      />
    </>
  );
}
