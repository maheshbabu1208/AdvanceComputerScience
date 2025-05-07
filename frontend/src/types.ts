export interface AIResponse {
  model: string;
  response: string;
  loading: boolean;
  error?: string;
}