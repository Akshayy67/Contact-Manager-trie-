// Contact related types
export interface Contact {
  id: string
  name: string
  phone: string
  email: string
  address?: string
  notes?: string
  tags: string[]
  dateCreated: Date
  dateModified: Date
}

export interface ContactFormData {
  name: string
  phone: string
  email: string
  address?: string
  notes?: string
  tags: string[]
}

export interface ContactValidationErrors {
  name?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  tags?: string
}

// Search related types
export interface SearchResult {
  contact: Contact
  relevanceScore: number
  matchedFields: string[]
  highlightedText: Record<string, string>
}

export interface SearchFilters {
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  fields?: (keyof Contact)[]
}

export interface SearchHistory {
  query: string
  timestamp: Date
  resultsCount: number
}

// Trie related types
export interface TrieNode<T = any> {
  children: Map<string, TrieNode<T>>
  isEndOfWord: boolean
  data: T[]
  frequency: number
}

export interface TrieSearchResult<T = any> {
  word: string
  data: T[]
  frequency: number
}

export interface TriePerformanceMetrics {
  insertTime: number
  searchTime: number
  memoryUsage: number
  nodeCount: number
  wordCount: number
}

export interface TrieVisualizationNode {
  id: string
  character: string
  isEndOfWord: boolean
  children: TrieVisualizationNode[]
  level: number
  frequency: number
  highlighted?: boolean
  x?: number
  y?: number
  isActive?: boolean
  isSearchPath?: boolean
  animationDelay?: number
}

export interface TrieVisualizationData {
  root: TrieVisualizationNode
  searchPath?: string[]
  currentSearchTerm?: string
  animationSpeed: number
  showFrequencies: boolean
  highlightEndNodes: boolean
}

export interface TrieAnimationStep {
  type: 'insert' | 'search' | 'delete' | 'highlight'
  nodeId: string
  character?: string
  description: string
  duration: number
}

export interface CodeExample {
  language: string
  code: string
  explanation?: string
  editable?: boolean
  runnable?: boolean
}

// UI related types
export type ViewMode = 'compact' | 'card' | 'detailed'
export type Theme = 'light' | 'dark' | 'system'
export type SortField = keyof Contact
export type SortDirection = 'asc' | 'desc'

export interface UIState {
  theme: Theme
  viewMode: ViewMode
  sidebarOpen: boolean
  selectedContacts: string[]
  sortField: SortField
  sortDirection: SortDirection
}

// Bulk operations
export interface BulkOperation {
  type: 'delete' | 'export' | 'tag'
  contactIds: string[]
  data?: any
}

export interface ExportOptions {
  format: 'csv' | 'json'
  fields: (keyof Contact)[]
  includeHeaders: boolean
}

// Learning module types
export interface LearningStep {
  id: string
  title: string
  description: string
  content: string
  code?: CodeExample
  visualization?: TrieVisualizationData
  interactive?: InteractiveExercise
  completed: boolean
  estimatedTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface InteractiveExercise {
  type: 'build-trie' | 'search-demo' | 'performance-test'
  instructions: string
  initialData?: any
  validation?: (userInput: any) => boolean
  hint?: string
}

export interface Quiz {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
}

export interface LearningProgress {
  currentStep: number
  completedSteps: string[]
  quizScores: Record<string, number>
  totalTimeSpent: number
  achievements: Achievement[]
  lastAccessed: Date
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: Date
  points: number
}

export interface PerformanceMetrics {
  trieSearchTime: number
  linearSearchTime: number
  datasetSize: number
  searchTerm: string
  timestamp: Date
  speedupFactor: number
}

// Performance comparison
export interface PerformanceComparison {
  trieTime: number
  linearTime: number
  datasetSize: number
  searchTerm: string
  timestamp: Date
}
