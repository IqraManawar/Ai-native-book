/**
 * RAG API client for the AI-Native Textbook chatbot.
 */

// API base URL - defaults to localhost for development
const API_BASE_URL = 'http://localhost:8000/v1';

/**
 * Citation from the textbook.
 */
export interface Citation {
  section_id: string;
  section_title: string;
  chapter_title: string;
  url: string;
  snippet?: string;
  relevance_score?: number;
}

/**
 * Query request to the RAG API.
 */
export interface QueryRequest {
  question: string;
  selected_context?: string;
  language?: 'en' | 'ur';
}

/**
 * Query response from the RAG API.
 */
export interface QueryResponse {
  answer: string;
  citations: Citation[];
  has_answer: boolean;
  confidence?: number;
  response_time_ms?: number;
}

/**
 * Health check response.
 */
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  qdrant_connected: boolean;
  gemini_available: boolean;
  version: string;
}

/**
 * API error response.
 */
export interface ApiError {
  error: string;
  message: string;
  retry_after?: number;
}

/**
 * RAG API client class.
 */
class RagClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check API health status.
   */
  async checkHealth(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  }

  /**
   * Ask a question about the textbook content.
   */
  async askQuestion(request: QueryRequest): Promise<QueryResponse> {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to get answer');
    }

    return response.json();
  }

  /**
   * Check if the API is available.
   */
  async isAvailable(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status !== 'unhealthy';
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const ragClient = new RagClient();

// Export class for custom instances
export { RagClient };
