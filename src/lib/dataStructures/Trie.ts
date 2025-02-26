export class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  data: any;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.data = null;
  }
}

export class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string, data: any = null): void {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
    current.data = data;
  }

  search(word: string): { found: boolean; data: any } {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        return { found: false, data: null };
      }
      current = current.children.get(char)!;
    }
    return { found: current.isEndOfWord, data: current.data };
  }

  findSimilar(prefix: string, maxDistance: number = 2): Array<{ word: string; data: any }> {
    const results: Array<{ word: string; data: any }> = [];
    this._findSimilarHelper(this.root, prefix.toLowerCase(), '', maxDistance, results);
    return results;
  }

  private _findSimilarHelper(
    node: TrieNode,
    target: string,
    current: string,
    maxDistance: number,
    results: Array<{ word: string; data: any }>
  ): void {
    if (node.isEndOfWord) {
      const distance = this._levenshteinDistance(current, target);
      if (distance <= maxDistance) {
        results.push({ word: current, data: node.data });
      }
    }

    for (const [char, childNode] of node.children) {
      this._findSimilarHelper(childNode, target, current + char, maxDistance, results);
    }
  }

  private _levenshteinDistance(s1: string, s2: string): number {
    const dp: number[][] = Array(s1.length + 1)
      .fill(0)
      .map(() => Array(s2.length + 1).fill(0));

    for (let i = 0; i <= s1.length; i++) dp[i][0] = i;
    for (let j = 0; j <= s2.length; j++) dp[0][j] = j;

    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (s1[i - 1] !== s2[j - 1] ? 1 : 0)
        );
      }
    }

    return dp[s1.length][s2.length];
  }
}