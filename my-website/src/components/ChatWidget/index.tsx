import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './styles.module.css';
import { ragClient, QueryRequest, QueryResponse, Citation } from '@site/src/services/ragClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  isLoading?: boolean;
  isError?: boolean;
}

interface ChatWidgetProps {
  selectedContext?: string;
  onContextUsed?: () => void;
}

type ServiceStatus = 'unknown' | 'checking' | 'available' | 'unavailable';

export default function ChatWidget({ selectedContext, onContextUsed }: ChatWidgetProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>('unknown');
  const [retryCount, setRetryCount] = useState(0);
  // Store context locally so it persists even after prop is cleared
  const [localContext, setLocalContext] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check service availability
  const checkServiceAvailability = useCallback(async () => {
    setServiceStatus('checking');
    try {
      const isAvailable = await ragClient.isAvailable();
      setServiceStatus(isAvailable ? 'available' : 'unavailable');
      if (isAvailable) {
        setError(null);
      }
    } catch {
      setServiceStatus('unavailable');
    }
  }, []);

  // Check service on mount and when opened
  useEffect(() => {
    if (isOpen && serviceStatus === 'unknown') {
      checkServiceAvailability();
    }
  }, [isOpen, serviceStatus, checkServiceAvailability]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle selected context from text selection
  // Auto-open chat when text is selected
  useEffect(() => {
    if (selectedContext) {
      // Store context locally for use in the request
      setLocalContext(selectedContext);
      // Open the chat panel
      setIsOpen(true);
      // Pre-fill the input with context reference
      const truncatedContext = selectedContext.slice(0, 200) + (selectedContext.length > 200 ? '...' : '');
      setInput(`About this text: "${truncatedContext}"\n\nMy question: `);
      // Notify parent that context has been consumed
      onContextUsed?.();
      // Focus will be set by the isOpen effect
    }
  }, [selectedContext, onContextUsed]);

  const generateId = () => Math.random().toString(36).substring(7);

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    await checkServiceAvailability();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Check service availability before sending
    if (serviceStatus === 'unavailable') {
      setError('AI service is currently unavailable. Please try again later.');
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: trimmedInput,
    };

    const loadingMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const request: QueryRequest = {
        question: trimmedInput,
        selected_context: localContext || undefined,
        language: 'en',
      };
      // Clear local context after using it in request
      setLocalContext(undefined);

      const response: QueryResponse = await ragClient.askQuestion(request);

      const assistantMessage: Message = {
        id: loadingMessage.id,
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
      };

      setMessages(prev =>
        prev.map(msg => msg.id === loadingMessage.id ? assistantMessage : msg)
      );
      // Reset retry count on success
      setRetryCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response';

      // Check if it's a network/service error
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to get answer')) {
        setServiceStatus('unavailable');
        setError('AI service is currently unavailable. The backend server may not be running.');
      } else {
        setError(errorMessage);
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: 'Sorry, I encountered an error. Please try again.',
                isLoading: false,
                isError: true,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setLocalContext(undefined);
  };

  const getStatusIndicator = () => {
    switch (serviceStatus) {
      case 'checking':
        return <span className={styles.statusDot + ' ' + styles.checking} title="Checking service..." />;
      case 'available':
        return <span className={styles.statusDot + ' ' + styles.available} title="AI service available" />;
      case 'unavailable':
        return <span className={styles.statusDot + ' ' + styles.unavailable} title="AI service unavailable" />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.chatWidget}>
      {/* Floating button */}
      <button
        className={`${styles.floatingButton} ${isOpen ? styles.hidden : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Chat"
        title="Ask AI about this textbook"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          <path d="M7 9h10v2H7zm0-3h10v2H7z"/>
        </svg>
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className={styles.chatPanel}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.titleWrapper}>
              <h3 className={styles.title}>Ask AI</h3>
              {getStatusIndicator()}
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.clearButton}
                onClick={clearChat}
                title="Clear chat"
                disabled={messages.length === 0}
              >
                Clear
              </button>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </div>

          {/* Service unavailable banner */}
          {serviceStatus === 'unavailable' && (
            <div className={styles.serviceBanner}>
              <div className={styles.serviceBannerContent}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>AI service unavailable</span>
              </div>
              <button
                className={styles.retryButton}
                onClick={handleRetry}
                disabled={serviceStatus === 'checking'}
              >
                {serviceStatus === 'checking' ? 'Checking...' : 'Retry'}
              </button>
            </div>
          )}

          {/* Messages */}
          <div className={styles.messages}>
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.3">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                  </svg>
                </div>
                <p className={styles.emptyTitle}>Ask me anything about this textbook!</p>
                <p className={styles.hint}>I can answer questions based on the book content.</p>
                {serviceStatus === 'unavailable' && (
                  <p className={styles.hintWarning}>
                    Note: The AI service is currently offline. Start the backend server to enable chat.
                  </p>
                )}
              </div>
            )}

            {messages.map(message => (
              <div
                key={message.id}
                className={`${styles.message} ${styles[message.role]} ${message.isError ? styles.errorMessage : ''}`}
              >
                {message.isLoading ? (
                  <div className={styles.loadingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <>
                    <div className={styles.messageContent}>{message.content}</div>
                    {message.citations && message.citations.length > 0 && (
                      <div className={styles.citations}>
                        <span className={styles.citationLabel}>Sources:</span>
                        {message.citations.map((citation, idx) => (
                          <a
                            key={idx}
                            href={citation.url}
                            className={styles.citationLink}
                            title={citation.snippet}
                          >
                            {citation.chapter_title}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Error display */}
          {error && (
            <div className={styles.error}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{error}</span>
              {serviceStatus === 'unavailable' && (
                <button className={styles.errorRetry} onClick={handleRetry}>
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Input */}
          <form className={styles.inputForm} onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={serviceStatus === 'unavailable' ? 'AI service unavailable...' : 'Ask a question...'}
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!input.trim() || isLoading || serviceStatus === 'unavailable'}
              aria-label="Send message"
              title={serviceStatus === 'unavailable' ? 'AI service unavailable' : 'Send message'}
            >
              {isLoading ? (
                <div className={styles.sendingSpinner} />
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
