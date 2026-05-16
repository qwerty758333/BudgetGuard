/** Expense categories supported by BudgetGuard. */
export const CATEGORIES = [
    'Food',
    'Entertainment',
    'Education',
    'Transport',
    'Shopping',
    'Healthcare',
    'Other',
  ] as const
  
  export type ExpenseCategory = (typeof CATEGORIES)[number]
  
  /** Result of an OpenAI category prediction for an expense description. */
  export interface CategoryPrediction {
    /** Suggested expense category. */
    category: string
    /** Model confidence from 0 to 1 (e.g. 0.95 = 95%). */
    confidence: number
    /** Brief explanation of why this category was chosen. */
    reasoning: string
  }
  
  interface OpenAIChatCompletionResponse {
    choices?: Array<{
      message?: {
        content?: string | null
      }
    }>
  }
  
  interface RawPredictionPayload {
    category?: unknown
    confidence?: unknown
    reasoning?: unknown
  }
  
  const OPENAI_CHAT_COMPLETIONS_URL =
    'https://api.openai.com/v1/chat/completions'
  
  const FALLBACK_API_KEY_MISSING: CategoryPrediction = {
    category: 'Other',
    confidence: 0,
    reasoning: 'API key not configured',
  }
  
  const FALLBACK_SERVICE_UNAVAILABLE: CategoryPrediction = {
    category: 'Other',
    confidence: 0,
    reasoning: 'AI service unavailable',
  }
  
  /**
   * Builds the user prompt sent to OpenAI for expense categorization.
   */
  function buildCategorizationPrompt(description: string): string {
    const categoryList = CATEGORIES.join(', ')
  
    return `Given this expense description: '${description}'
  Choose the BEST category from: ${categoryList}
  
  Respond ONLY with valid JSON (no markdown, no backticks, no explanation):
  {"category": "CategoryName", "confidence": 0.95, "reasoning": "explanation"}`
  }
  
  /**
   * Extracts and parses JSON from the model response content.
   */
  function parsePredictionContent(content: string): RawPredictionPayload | null {
    const trimmed = content.trim()
    const withoutFences = trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()
  
    try {
      return JSON.parse(withoutFences) as RawPredictionPayload
    } catch {
      return null
    }
  }
  
  /**
   * Normalizes raw model output into a valid {@link CategoryPrediction}.
   */
  function normalizePrediction(payload: RawPredictionPayload): CategoryPrediction {
    const category =
      typeof payload.category === 'string' &&
      CATEGORIES.includes(payload.category as ExpenseCategory)
        ? payload.category
        : 'Other'
  
    const rawConfidence =
      typeof payload.confidence === 'number'
        ? payload.confidence
        : Number(payload.confidence)
  
    const confidence = Number.isFinite(rawConfidence)
      ? Math.min(1, Math.max(0, rawConfidence))
      : 0
  
    const reasoning =
      typeof payload.reasoning === 'string' && payload.reasoning.trim().length > 0
        ? payload.reasoning.trim()
        : 'No reasoning provided'
  
    return { category, confidence, reasoning }
  }
  
  /**
   * Predicts the best expense category for a free-text description using OpenAI.
   *
   * @param description - User-entered expense description or notes
   * @returns Predicted category, confidence score, and reasoning
   */
  export async function predictCategory(
    description: string,
  ): Promise<CategoryPrediction> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return FALLBACK_API_KEY_MISSING
    }
  
    const trimmedDescription = description.trim()
    if (trimmedDescription.length === 0) {
      return {
        category: 'Other',
        confidence: 0,
        reasoning: 'Description is empty',
      }
    }
  
    try {
      const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          temperature: 0.3,
          max_tokens: 100,
          messages: [
            {
              role: 'user',
              content: buildCategorizationPrompt(trimmedDescription),
            },
          ],
        }),
      })
  
      if (!response.ok) {
        return FALLBACK_SERVICE_UNAVAILABLE
      }
  
      const data = (await response.json()) as OpenAIChatCompletionResponse
      const content = data.choices?.[0]?.message?.content
  
      if (!content || typeof content !== 'string') {
        return FALLBACK_SERVICE_UNAVAILABLE
      }
  
      const payload = parsePredictionContent(content)
      if (!payload) {
        return FALLBACK_SERVICE_UNAVAILABLE
      }
  
      return normalizePrediction(payload)
    } catch {
      return FALLBACK_SERVICE_UNAVAILABLE
    }
  }