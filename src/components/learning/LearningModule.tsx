import React, { useState } from 'react'
import {
  BookOpen,
  Award,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Button from '../ui/Button'
import LearningStep from './LearningStep'
import Quiz from './Quiz'
import ProgressTracker from './ProgressTracker'
import PerformanceComparison from './PerformanceComparison'
import {
  LearningStep as LearningStepType,
  Quiz as QuizType,
  LearningProgress,
  Contact,
} from './types'

interface LearningModuleProps {
  contacts: Contact[]
  className?: string
}

const LearningModule: React.FC<LearningModuleProps> = ({
  contacts,
  className = '',
}) => {
  const [currentView, setCurrentView] = useState<
    'overview' | 'lesson' | 'quiz' | 'performance'
  >('overview')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [progress, setProgress] = useState<LearningProgress>({
    currentStep: 0,
    completedSteps: [],
    quizScores: {},
    totalTimeSpent: 0,
    achievements: [],
    lastAccessed: new Date(),
  })

  // Sample learning steps data
  const learningSteps: LearningStepType[] = [
    {
      id: 'intro-to-tries',
      title: 'Introduction to Trie Data Structures',
      description:
        "Learn what Tries are and why they're perfect for search applications",
      content: `
        <h3>What is a Trie?</h3>
        <p>A Trie (pronounced "try") is a tree-like data structure that stores a dynamic set of strings, where the keys are usually strings. It's also known as a prefix tree because it can efficiently find all keys with a common prefix.</p>
        
        <h4>Key Characteristics:</h4>
        <ul>
          <li><strong>Prefix-based:</strong> Each node represents a character, and paths from root to leaves represent complete words</li>
          <li><strong>Efficient search:</strong> Search time is O(m) where m is the length of the search key</li>
          <li><strong>Space optimization:</strong> Common prefixes are shared between words</li>
          <li><strong>Autocomplete friendly:</strong> Perfect for implementing search suggestions</li>
        </ul>
        
        <h4>Real-world Applications:</h4>
        <ul>
          <li>Search engines and autocomplete systems</li>
          <li>Spell checkers and word processors</li>
          <li>IP routing tables in networking</li>
          <li>Contact management systems (like this one!)</li>
        </ul>
      `,
      code: {
        language: 'typescript',
        code: `// Basic Trie Node structure
class TrieNode {
  children: Map<string, TrieNode>
  isEndOfWord: boolean
  
  constructor() {
    this.children = new Map()
    this.isEndOfWord = false
  }
}

// Simple Trie implementation
class Trie {
  private root: TrieNode
  
  constructor() {
    this.root = new TrieNode()
  }
  
  // Insert a word into the Trie
  insert(word: string): void {
    let current = this.root
    
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode())
      }
      current = current.children.get(char)!
    }
    
    current.isEndOfWord = true
  }
  
  // Search for a word in the Trie
  search(word: string): boolean {
    let current = this.root
    
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        return false
      }
      current = current.children.get(char)!
    }
    
    return current.isEndOfWord
  }
}`,
        explanation:
          'This basic Trie implementation shows how words are stored character by character, with each node representing a character and paths representing complete words.',
        editable: false,
        runnable: false,
      },
      completed: false,
      estimatedTime: 10,
      difficulty: 'beginner',
    },
    {
      id: 'trie-operations',
      title: 'Trie Operations: Insert, Search, and Delete',
      description: 'Master the fundamental operations of Trie data structures',
      content: `
        <h3>Core Trie Operations</h3>
        <p>Understanding the three fundamental operations is crucial for working with Tries effectively.</p>
        
        <h4>1. Insert Operation</h4>
        <p>Adding a new word to the Trie involves traversing from the root, creating new nodes as needed for each character.</p>
        
        <h4>2. Search Operation</h4>
        <p>Finding a word requires traversing the path corresponding to the word's characters and checking if the final node marks the end of a word.</p>
        
        <h4>3. Delete Operation</h4>
        <p>Removing a word is more complex - we need to be careful not to break other words that share prefixes.</p>
        
        <h4>Time Complexity Analysis:</h4>
        <ul>
          <li><strong>Insert:</strong> O(m) where m is the length of the word</li>
          <li><strong>Search:</strong> O(m) where m is the length of the word</li>
          <li><strong>Delete:</strong> O(m) where m is the length of the word</li>
        </ul>
      `,
      interactive: {
        type: 'build-trie',
        instructions:
          'Try building your own Trie by inserting words. Watch how the structure grows with each addition.',
        hint: 'Start with simple words like "cat", "car", "card" to see how they share common prefixes.',
      },
      completed: false,
      estimatedTime: 15,
      difficulty: 'intermediate',
    },
    {
      id: 'contact-search-implementation',
      title: 'Implementing Contact Search with Tries',
      description:
        'See how Tries power the search functionality in this contact manager',
      content: `
        <h3>Contact Search with Tries</h3>
        <p>In this contact manager, we use a specialized Trie to enable fast searching across multiple contact fields.</p>
        
        <h4>Multi-field Indexing</h4>
        <p>Unlike a simple word Trie, our contact search indexes multiple fields:</p>
        <ul>
          <li>Contact names (first and last)</li>
          <li>Email addresses</li>
          <li>Phone numbers</li>
          <li>Addresses</li>
          <li>Tags and notes</li>
        </ul>
        
        <h4>Prefix Matching</h4>
        <p>As you type in the search box, the Trie quickly finds all contacts that match your input as a prefix, enabling real-time search suggestions.</p>
        
        <h4>Performance Benefits</h4>
        <p>With ${contacts.length} contacts in your database, traditional linear search would require checking every contact. Our Trie-based search only needs to follow the path of your search term.</p>
      `,
      interactive: {
        type: 'search-demo',
        instructions:
          'Try searching for contacts using different prefixes. Notice how quickly results appear!',
        hint: 'Try searching for just the first few letters of a name or email address.',
      },
      completed: false,
      estimatedTime: 12,
      difficulty: 'intermediate',
    },
  ]

  // Sample quiz questions
  const quizQuestions: QuizType[] = [
    {
      id: 'trie-complexity',
      question:
        'What is the time complexity of searching for a word of length m in a Trie?',
      options: ['O(1)', 'O(log n)', 'O(m)', 'O(n)'],
      correctAnswer: 2,
      explanation:
        'Trie search is O(m) where m is the length of the search word, because we need to traverse exactly m nodes from root to the target.',
      difficulty: 'medium',
      points: 10,
    },
    {
      id: 'trie-advantage',
      question:
        'What is the main advantage of using a Trie for autocomplete functionality?',
      options: [
        'It uses less memory than other data structures',
        'It can find all words with a common prefix efficiently',
        'It sorts words automatically',
        'It works only with strings',
      ],
      correctAnswer: 1,
      explanation:
        'Tries excel at prefix-based operations. Finding all words that start with a given prefix is very efficient because all such words are in the same subtree.',
      difficulty: 'easy',
      points: 5,
    },
  ]

  const handleStepComplete = (stepId: string) => {
    setProgress(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, stepId],
      currentStep: Math.max(prev.currentStep, currentStepIndex + 1),
    }))
  }

  const handleQuizComplete = (score: number, timeSpent: number) => {
    const quizId = quizQuestions[0]?.id
    if (quizId) {
      setProgress(prev => ({
        ...prev,
        quizScores: { ...prev.quizScores, [quizId]: score },
        totalTimeSpent: prev.totalTimeSpent + timeSpent,
      }))
    }
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8">
        <h2 className="text-3xl font-bold mb-4">Learn Trie Data Structures</h2>
        <p className="text-blue-100 mb-6 text-lg">
          Discover how Trie data structures power lightning-fast search in this
          contact manager. Master the concepts through interactive lessons, code
          examples, and hands-on exercises.
        </p>
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setCurrentView('lesson')}
          >
            Start Learning
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setCurrentView('performance')}
            className="border-white text-white hover:bg-white hover:text-blue-600"
          >
            See Performance Demo
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <ProgressTracker progress={progress} totalSteps={learningSteps.length} />

      {/* Learning Path */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="font-semibold text-gray-900">Interactive Lessons</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Step-by-step lessons with visual examples and interactive exercises.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('lesson')}
          >
            Start Lessons
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <Award className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="font-semibold text-gray-900">Knowledge Quiz</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Test your understanding with interactive quiz questions.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('quiz')}
          >
            Take Quiz
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
            <h3 className="font-semibold text-gray-900">
              Performance Analysis
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Compare Trie vs linear search performance with real data.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('performance')}
          >
            Run Analysis
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {currentView !== 'overview' && (
            <Button
              variant="outline"
              icon={ChevronLeft}
              onClick={() => setCurrentView('overview')}
            >
              Back to Overview
            </Button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {currentView === 'overview' && 'Learning Module'}
            {currentView === 'lesson' &&
              `Lesson ${currentStepIndex + 1}: ${learningSteps[currentStepIndex]?.title}`}
            {currentView === 'quiz' && 'Knowledge Quiz'}
            {currentView === 'performance' && 'Performance Analysis'}
          </h1>
        </div>

        {currentView === 'lesson' && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              icon={ChevronLeft}
              onClick={() =>
                setCurrentStepIndex(Math.max(0, currentStepIndex - 1))
              }
              disabled={currentStepIndex === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              {currentStepIndex + 1} of {learningSteps.length}
            </span>
            <Button
              variant="outline"
              icon={ChevronRight}
              iconPosition="right"
              onClick={() =>
                setCurrentStepIndex(
                  Math.min(learningSteps.length - 1, currentStepIndex + 1)
                )
              }
              disabled={currentStepIndex === learningSteps.length - 1}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {currentView === 'overview' && renderOverview()}

      {currentView === 'lesson' && learningSteps[currentStepIndex] && (
        <LearningStep
          step={learningSteps[currentStepIndex]}
          onComplete={handleStepComplete}
          onNext={() =>
            setCurrentStepIndex(
              Math.min(learningSteps.length - 1, currentStepIndex + 1)
            )
          }
          onPrevious={() =>
            setCurrentStepIndex(Math.max(0, currentStepIndex - 1))
          }
          hasNext={currentStepIndex < learningSteps.length - 1}
          hasPrevious={currentStepIndex > 0}
        />
      )}

      {currentView === 'quiz' && quizQuestions[0] && (
        <Quiz quiz={quizQuestions[0]} onComplete={handleQuizComplete} />
      )}

      {currentView === 'performance' && (
        <PerformanceComparison contacts={contacts} />
      )}
    </div>
  )
}

export default LearningModule
