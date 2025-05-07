export type TestCategory = 'text' | 'code' | 'math' | 'hallucination';

export type TestDifficulty = 'easy' | 'medium' | 'hard';

export interface EvaluationCriteria {
    accuracy: number;
    clarity: number;
    completeness: number;
    reliability: number;
}

export interface TestCase {
    id: string;
    category: TestCategory;
    title: string;
    description: string;
    prompt: string;
    imageUrl?: string;
    expectedOutput?: any;
    evaluationCriteria: string[];
    difficulty: TestDifficulty;
}

export interface ModelResponse {
    model: string;
    response: string;
    scores: EvaluationCriteria;
    processingTime: number;
    error?: string;
}

export interface TestResult {
    testId: string;
    timestamp: Date;
    category: TestCategory;
    prompt: string;
    imageUrl?: string;
    responses: ModelResponse[];
    comparison: {
        bestPerformer: string;
        analysis: string;
        recommendations: string[];
    };
}

export interface CategoryAnalysis {
    category: TestCategory;
    totalTests: number;
    modelPerformance: {
        [key: string]: {
            averageScore: number;
            strengths: string[];
            weaknesses: string[];
        };
    };
    trends: string[];
}

export interface TestSuite {
    id: string;
    name: string;
    description: string;
    categories: TestCategory[];
    testCases: TestCase[];
    results?: TestResult[];
} 