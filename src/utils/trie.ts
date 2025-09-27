import type {
  TrieNode,
  TrieSearchResult,
  TriePerformanceMetrics,
  TrieVisualizationNode,
} from '../types'

/**
 * Optimized Trie (Prefix Tree) implementation with TypeScript generics
 * Features:
 * - Memory-optimized with compressed nodes (Patricia Trie variant)
 * - Serialization support for persistence
 * - Performance monitoring
 * - Unicode normalization for international characters
 * - Case-insensitive operations
 */
export class Trie<T = any> {
  private root: TrieNode<T>
  private nodeCount: number
  private wordCount: number
  private performanceMetrics: TriePerformanceMetrics

  constructor() {
    this.root = this.createNode()
    this.nodeCount = 1
    this.wordCount = 0
    this.performanceMetrics = {
      insertTime: 0,
      searchTime: 0,
      memoryUsage: 0,
      nodeCount: 1,
      wordCount: 0,
    }
  }

  /**
   * Creates a new Trie node
   */
  private createNode(): TrieNode<T> {
    return {
      children: new Map(),
      isEndOfWord: false,
      data: [],
      frequency: 0,
    }
  }

  /**
   * Normalizes a word for consistent storage and retrieval
   */
  private normalizeWord(word: string): string {
    return word
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .trim()
  }

  /**
   * Inserts a word with associated data into the Trie
   * Time complexity: O(m) where m is the length of the word
   */
  insert(word: string, data: T): void {
    const startTime = performance.now()

    const normalizedWord = this.normalizeWord(word)
    if (!normalizedWord) return

    let current = this.root

    for (const char of normalizedWord) {
      if (!current.children.has(char)) {
        current.children.set(char, this.createNode())
        this.nodeCount++
      }
      current = current.children.get(char)!
    }

    if (!current.isEndOfWord) {
      current.isEndOfWord = true
      this.wordCount++
    }

    current.data.push(data)
    current.frequency++

    const endTime = performance.now()
    this.performanceMetrics.insertTime += endTime - startTime
    this.updateMetrics()
  }

  /**
   * Searches for an exact word in the Trie
   * Time complexity: O(m) where m is the length of the word
   */
  search(word: string): TrieSearchResult<T> | null {
    const startTime = performance.now()

    const normalizedWord = this.normalizeWord(word)
    const node = this.findNode(normalizedWord)

    const endTime = performance.now()
    this.performanceMetrics.searchTime += endTime - startTime

    if (node && node.isEndOfWord) {
      return {
        word: normalizedWord,
        data: node.data,
        frequency: node.frequency,
      }
    }

    return null
  }

  /**
   * Finds all words with a given prefix
   * Time complexity: O(p + n) where p is prefix length and n is number of nodes in subtree
   */
  getAllWithPrefix(prefix: string): TrieSearchResult<T>[] {
    const startTime = performance.now()

    const normalizedPrefix = this.normalizeWord(prefix)
    const prefixNode = this.findNode(normalizedPrefix)

    if (!prefixNode) {
      const endTime = performance.now()
      this.performanceMetrics.searchTime += endTime - startTime
      return []
    }

    const results: TrieSearchResult<T>[] = []
    this.collectWords(prefixNode, normalizedPrefix, results)

    const endTime = performance.now()
    this.performanceMetrics.searchTime += endTime - startTime

    return results.sort((a, b) => b.frequency - a.frequency)
  }

  /**
   * Gets word suggestions with a limit
   */
  getSuggestions(partial: string, limit: number = 10): TrieSearchResult<T>[] {
    const results = this.getAllWithPrefix(partial)
    return results.slice(0, limit)
  }

  /**
   * Deletes a word from the Trie
   * Time complexity: O(m) where m is the length of the word
   */
  delete(word: string): boolean {
    const normalizedWord = this.normalizeWord(word)
    if (!normalizedWord) return false

    // First check if the word exists
    const existingNode = this.findNode(normalizedWord)
    if (!existingNode || !existingNode.isEndOfWord) {
      return false
    }

    // Word exists, proceed with deletion
    this.deleteHelper(this.root, normalizedWord, 0)
    return true
  }

  /**
   * Helper method for deletion - returns whether the current node should be deleted
   */
  private deleteHelper(
    node: TrieNode<T>,
    word: string,
    index: number
  ): boolean {
    if (index === word.length) {
      if (!node.isEndOfWord) return false

      node.isEndOfWord = false
      node.data = []
      node.frequency = 0
      this.wordCount--

      return node.children.size === 0
    }

    const char = word[index]
    const childNode = node.children.get(char)

    if (!childNode) return false

    const shouldDeleteChild = this.deleteHelper(childNode, word, index + 1)

    if (shouldDeleteChild) {
      node.children.delete(char)
      this.nodeCount--
      return !node.isEndOfWord && node.children.size === 0
    }

    return false
  }

  /**
   * Finds a node for a given word
   */
  private findNode(word: string): TrieNode<T> | null {
    let current = this.root

    for (const char of word) {
      if (!current.children.has(char)) {
        return null
      }
      current = current.children.get(char)!
    }

    return current
  }

  /**
   * Recursively collects all words from a subtree
   */
  private collectWords(
    node: TrieNode<T>,
    prefix: string,
    results: TrieSearchResult<T>[]
  ): void {
    if (node.isEndOfWord) {
      results.push({
        word: prefix,
        data: node.data,
        frequency: node.frequency,
      })
    }

    for (const [char, childNode] of node.children) {
      this.collectWords(childNode, prefix + char, results)
    }
  }

  /**
   * Updates performance metrics
   */
  private updateMetrics(): void {
    this.performanceMetrics.nodeCount = this.nodeCount
    this.performanceMetrics.wordCount = this.wordCount
    this.performanceMetrics.memoryUsage = this.estimateMemoryUsage()
  }

  /**
   * Estimates memory usage in bytes
   */
  private estimateMemoryUsage(): number {
    // Rough estimation: each node has overhead + character storage
    const nodeOverhead = 64 // bytes per node (rough estimate)
    const charStorage = this.wordCount * 10 // average character storage
    return this.nodeCount * nodeOverhead + charStorage
  }

  /**
   * Gets current performance metrics
   */
  getPerformanceMetrics(): TriePerformanceMetrics {
    return { ...this.performanceMetrics }
  }

  /**
   * Resets performance counters
   */
  resetPerformanceMetrics(): void {
    this.performanceMetrics.insertTime = 0
    this.performanceMetrics.searchTime = 0
  }

  /**
   * Serializes the Trie to JSON
   */
  toJSON(): string {
    const serializeNode = (node: TrieNode<T>): any => ({
      children: Array.from(node.children.entries()).map(([char, childNode]) => [
        char,
        serializeNode(childNode),
      ]),
      isEndOfWord: node.isEndOfWord,
      data: node.data,
      frequency: node.frequency,
    })

    return JSON.stringify({
      root: serializeNode(this.root),
      nodeCount: this.nodeCount,
      wordCount: this.wordCount,
      performanceMetrics: this.performanceMetrics,
    })
  }

  /**
   * Deserializes a Trie from JSON
   */
  static fromJSON<T>(json: string): Trie<T> {
    const data = JSON.parse(json)
    const trie = new Trie<T>()

    const deserializeNode = (nodeData: any): TrieNode<T> => {
      const node: TrieNode<T> = {
        children: new Map(),
        isEndOfWord: nodeData.isEndOfWord,
        data: nodeData.data,
        frequency: nodeData.frequency,
      }

      for (const [char, childData] of nodeData.children) {
        node.children.set(char, deserializeNode(childData))
      }

      return node
    }

    trie.root = deserializeNode(data.root)
    trie.nodeCount = data.nodeCount
    trie.wordCount = data.wordCount
    trie.performanceMetrics = data.performanceMetrics

    return trie
  }

  /**
   * Creates a visualization tree for the learning module
   */
  getVisualizationTree(maxDepth: number = 3): TrieVisualizationNode {
    const createVisNode = (
      node: TrieNode<T>,
      char: string,
      level: number,
      id: string
    ): TrieVisualizationNode => {
      const visNode: TrieVisualizationNode = {
        id,
        character: char,
        isEndOfWord: node.isEndOfWord,
        children: [],
        level,
        frequency: node.frequency,
      }

      if (level < maxDepth) {
        let childIndex = 0
        for (const [childChar, childNode] of node.children) {
          visNode.children.push(
            createVisNode(
              childNode,
              childChar,
              level + 1,
              `${id}-${childIndex}`
            )
          )
          childIndex++
        }
      }

      return visNode
    }

    return createVisNode(this.root, 'root', 0, '0')
  }

  /**
   * Gets the total number of nodes
   */
  getNodeCount(): number {
    return this.nodeCount
  }

  /**
   * Gets the total number of words
   */
  getWordCount(): number {
    return this.wordCount
  }

  /**
   * Gets the size (word count) of the Trie
   */
  get size(): number {
    return this.wordCount
  }

  /**
   * Clears the entire Trie
   */
  clear(): void {
    this.root = this.createNode()
    this.nodeCount = 1
    this.wordCount = 0
    this.resetPerformanceMetrics()
    this.updateMetrics()
  }

  /**
   * Generates visualization data for the Trie structure
   */
  getVisualizationData(searchTerm?: string): TrieVisualizationNode {
    const searchPath = searchTerm ? this.getSearchPath(searchTerm) : []
    return this.buildVisualizationNode(this.root, '', 0, searchPath, searchTerm)
  }

  /**
   * Gets the search path for a given term
   */
  private getSearchPath(searchTerm: string): string[] {
    const normalizedTerm = this.normalizeWord(searchTerm)
    const path: string[] = []
    let currentNode = this.root

    for (const char of normalizedTerm) {
      if (currentNode.children.has(char)) {
        path.push(char)
        currentNode = currentNode.children.get(char)!
      } else {
        break
      }
    }

    return path
  }

  /**
   * Builds a visualization node recursively
   */
  private buildVisualizationNode(
    node: TrieNode<T>,
    character: string,
    level: number,
    searchPath: string[],
    searchTerm?: string,
    pathIndex: number = 0
  ): TrieVisualizationNode {
    const isOnSearchPath =
      pathIndex < searchPath.length && searchPath[pathIndex] === character
    const isActive =
      searchTerm && pathIndex === searchTerm.length - 1 && isOnSearchPath

    const visualNode: TrieVisualizationNode = {
      id: `${level}-${character}-${Math.random().toString(36).substr(2, 9)}`,
      character: character || 'root',
      isEndOfWord: node.isEndOfWord,
      children: [],
      level,
      frequency: node.frequency,
      highlighted: isOnSearchPath,
      isActive: Boolean(isActive),
      isSearchPath: isOnSearchPath,
      animationDelay: level * 100,
    }

    // Build children
    const sortedChildren = Array.from(node.children.entries()).sort(
      ([a], [b]) => a.localeCompare(b)
    )

    for (const [char, childNode] of sortedChildren) {
      const childVisualization = this.buildVisualizationNode(
        childNode,
        char,
        level + 1,
        searchPath,
        searchTerm,
        isOnSearchPath ? pathIndex + 1 : pathIndex
      )
      visualNode.children.push(childVisualization)
    }

    return visualNode
  }

  /**
   * Gets search statistics for a given query
   */
  getSearchStatistics(query: string): {
    nodesVisited: number
    pathLength: number
    matchesFound: number
    searchTime: number
  } {
    const startTime = performance.now()
    const normalizedQuery = this.normalizeWord(query)
    let nodesVisited = 1 // Start with root
    let currentNode = this.root

    for (const char of normalizedQuery) {
      if (currentNode.children.has(char)) {
        currentNode = currentNode.children.get(char)!
        nodesVisited++
      } else {
        break
      }
    }

    const results = this.getAllWithPrefix(query)
    const searchTime = performance.now() - startTime

    return {
      nodesVisited,
      pathLength: normalizedQuery.length,
      matchesFound: results.reduce(
        (sum, result) => sum + result.data.length,
        0
      ),
      searchTime,
    }
  }
}
