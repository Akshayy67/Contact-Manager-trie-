export interface TrieNode {
  isEndOfWord: boolean;
  children: Map<string, TrieNode>;
  contacts: Set<string>; // contact IDs
  frequency: number;
}

export interface TrieSearchOptions {
  maxResults?: number;
  fuzzyThreshold?: number;
  includePartialMatches?: boolean;
}

export interface TrieVisualizationNode {
  id: string;
  char: string;
  isEndOfWord: boolean;
  contacts: string[];
  children: TrieVisualizationNode[];
  level: number;
  x: number;
  y: number;
  isHighlighted?: boolean;
  isActive?: boolean;
}

export interface TrieOperation {
  type: 'insert' | 'search' | 'delete';
  word: string;
  steps: TrieStep[];
  result?: boolean | string[];
}

export interface TrieStep {
  nodeId: string;
  action: string;
  description: string;
  currentWord: string;
  highlightedPath: string[];
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessons: Lesson[];
  exercises: Exercise[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  codeExamples: CodeExample[];
  visualization?: TrieVisualizationNode;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solution: string;
  tests: TestCase[];
  hints: string[];
}

export interface CodeExample {
  language: string;
  code: string;
  explanation: string;
}

export interface TestCase {
  input: any;
  expectedOutput: any;
  description: string;
}