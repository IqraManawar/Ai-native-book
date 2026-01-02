/**
 * User progress tracking service using localStorage.
 * Tracks chapter views, completion status, and reading history.
 */

const STORAGE_KEY = 'textbook_user_progress';

/**
 * Chapter progress data.
 */
export interface ChapterProgress {
  chapterId: string;
  title: string;
  firstViewed: string; // ISO date
  lastViewed: string; // ISO date
  viewCount: number;
  completed: boolean;
  timeSpentSeconds: number;
}

/**
 * User's overall progress.
 */
export interface UserProgress {
  userId: string; // Generated UUID for anonymous tracking
  startedAt: string; // ISO date
  lastActiveAt: string; // ISO date
  chapters: Record<string, ChapterProgress>;
  bookmarks: Bookmark[];
  notes: Note[];
  currentChapter?: string;
}

/**
 * Bookmark for quick navigation.
 */
export interface Bookmark {
  id: string;
  chapterId: string;
  sectionId?: string;
  title: string;
  createdAt: string;
  url: string;
}

/**
 * User note attached to content.
 */
export interface Note {
  id: string;
  chapterId: string;
  sectionId?: string;
  content: string;
  selectedText?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Chapter definition for the textbook.
 */
export interface ChapterDefinition {
  id: string;
  title: string;
  order: number;
  prerequisites?: string[];
}

/**
 * Learning recommendation.
 */
export interface Recommendation {
  chapterId: string;
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

// Chapter definitions with prerequisites
const CHAPTERS: ChapterDefinition[] = [
  { id: 'intro', title: 'Introduction', order: 0 },
  { id: 'chapter-1-physical-ai', title: 'Physical AI Fundamentals', order: 1 },
  { id: 'chapter-2-humanoid-robotics', title: 'Humanoid Robotics', order: 2, prerequisites: ['chapter-1-physical-ai'] },
  { id: 'chapter-3-ros2', title: 'ROS 2 Framework', order: 3, prerequisites: ['chapter-1-physical-ai'] },
  { id: 'chapter-4-digital-twin', title: 'Digital Twin Technology', order: 4, prerequisites: ['chapter-3-ros2'] },
  { id: 'chapter-5-vla-systems', title: 'Vision-Language-Action Systems', order: 5, prerequisites: ['chapter-1-physical-ai', 'chapter-2-humanoid-robotics'] },
  { id: 'chapter-6-capstone', title: 'Capstone Project', order: 6, prerequisites: ['chapter-4-digital-twin', 'chapter-5-vla-systems'] },
];

/**
 * Generate a UUID for anonymous user tracking.
 */
function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Progress Tracker class for managing user learning progress.
 */
class ProgressTracker {
  private progress: UserProgress | null = null;
  private sessionStartTime: number = 0;
  private currentChapterStartTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadProgress();
      this.sessionStartTime = Date.now();
    }
  }

  /**
   * Load progress from localStorage.
   */
  private loadProgress(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.progress = JSON.parse(stored);
      } else {
        this.initializeProgress();
      }
    } catch {
      this.initializeProgress();
    }
  }

  /**
   * Initialize new user progress.
   */
  private initializeProgress(): void {
    const now = new Date().toISOString();
    this.progress = {
      userId: generateUserId(),
      startedAt: now,
      lastActiveAt: now,
      chapters: {},
      bookmarks: [],
      notes: [],
    };
    this.saveProgress();
  }

  /**
   * Save progress to localStorage.
   */
  private saveProgress(): void {
    if (this.progress && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
      } catch (e) {
        console.error('Failed to save progress:', e);
      }
    }
  }

  /**
   * Get current user progress.
   */
  getProgress(): UserProgress | null {
    return this.progress;
  }

  /**
   * Track a chapter view.
   */
  trackChapterView(chapterId: string, title?: string): void {
    if (!this.progress) return;

    const now = new Date().toISOString();
    const chapterDef = CHAPTERS.find(c => c.id === chapterId);
    const chapterTitle = title || chapterDef?.title || chapterId;

    // Save time spent on previous chapter
    if (this.progress.currentChapter && this.currentChapterStartTime > 0) {
      const timeSpent = Math.floor((Date.now() - this.currentChapterStartTime) / 1000);
      const prevChapter = this.progress.chapters[this.progress.currentChapter];
      if (prevChapter) {
        prevChapter.timeSpentSeconds += timeSpent;
      }
    }

    // Update or create chapter progress
    if (this.progress.chapters[chapterId]) {
      this.progress.chapters[chapterId].lastViewed = now;
      this.progress.chapters[chapterId].viewCount += 1;
    } else {
      this.progress.chapters[chapterId] = {
        chapterId,
        title: chapterTitle,
        firstViewed: now,
        lastViewed: now,
        viewCount: 1,
        completed: false,
        timeSpentSeconds: 0,
      };
    }

    this.progress.currentChapter = chapterId;
    this.progress.lastActiveAt = now;
    this.currentChapterStartTime = Date.now();
    this.saveProgress();
  }

  /**
   * Mark a chapter as completed.
   */
  markChapterCompleted(chapterId: string): void {
    if (!this.progress || !this.progress.chapters[chapterId]) return;

    this.progress.chapters[chapterId].completed = true;
    this.saveProgress();
  }

  /**
   * Mark a chapter as incomplete.
   */
  markChapterIncomplete(chapterId: string): void {
    if (!this.progress || !this.progress.chapters[chapterId]) return;

    this.progress.chapters[chapterId].completed = false;
    this.saveProgress();
  }

  /**
   * Add a bookmark.
   */
  addBookmark(chapterId: string, title: string, url: string, sectionId?: string): string {
    if (!this.progress) return '';

    const id = 'bm_' + Date.now().toString(36);
    const bookmark: Bookmark = {
      id,
      chapterId,
      sectionId,
      title,
      createdAt: new Date().toISOString(),
      url,
    };

    this.progress.bookmarks.push(bookmark);
    this.saveProgress();
    return id;
  }

  /**
   * Remove a bookmark.
   */
  removeBookmark(bookmarkId: string): void {
    if (!this.progress) return;

    this.progress.bookmarks = this.progress.bookmarks.filter(b => b.id !== bookmarkId);
    this.saveProgress();
  }

  /**
   * Get all bookmarks.
   */
  getBookmarks(): Bookmark[] {
    return this.progress?.bookmarks || [];
  }

  /**
   * Add a note.
   */
  addNote(chapterId: string, content: string, selectedText?: string, sectionId?: string): string {
    if (!this.progress) return '';

    const now = new Date().toISOString();
    const id = 'note_' + Date.now().toString(36);
    const note: Note = {
      id,
      chapterId,
      sectionId,
      content,
      selectedText,
      createdAt: now,
      updatedAt: now,
    };

    this.progress.notes.push(note);
    this.saveProgress();
    return id;
  }

  /**
   * Update a note.
   */
  updateNote(noteId: string, content: string): void {
    if (!this.progress) return;

    const note = this.progress.notes.find(n => n.id === noteId);
    if (note) {
      note.content = content;
      note.updatedAt = new Date().toISOString();
      this.saveProgress();
    }
  }

  /**
   * Remove a note.
   */
  removeNote(noteId: string): void {
    if (!this.progress) return;

    this.progress.notes = this.progress.notes.filter(n => n.id !== noteId);
    this.saveProgress();
  }

  /**
   * Get notes for a chapter.
   */
  getNotesForChapter(chapterId: string): Note[] {
    return this.progress?.notes.filter(n => n.chapterId === chapterId) || [];
  }

  /**
   * Get all notes.
   */
  getAllNotes(): Note[] {
    return this.progress?.notes || [];
  }

  /**
   * Get completion percentage.
   */
  getCompletionPercentage(): number {
    if (!this.progress) return 0;

    const totalChapters = CHAPTERS.length;
    const completedChapters = Object.values(this.progress.chapters).filter(c => c.completed).length;
    return Math.round((completedChapters / totalChapters) * 100);
  }

  /**
   * Get viewed chapters count.
   */
  getViewedChaptersCount(): number {
    if (!this.progress) return 0;
    return Object.keys(this.progress.chapters).length;
  }

  /**
   * Get total time spent reading (in seconds).
   */
  getTotalTimeSpent(): number {
    if (!this.progress) return 0;

    let total = Object.values(this.progress.chapters).reduce(
      (sum, chapter) => sum + chapter.timeSpentSeconds,
      0
    );

    // Add current session time for active chapter
    if (this.progress.currentChapter && this.currentChapterStartTime > 0) {
      total += Math.floor((Date.now() - this.currentChapterStartTime) / 1000);
    }

    return total;
  }

  /**
   * Format time spent as human-readable string.
   */
  formatTimeSpent(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  /**
   * Get recommended next chapters based on progress.
   */
  getRecommendations(): Recommendation[] {
    if (!this.progress) return [];

    const recommendations: Recommendation[] = [];
    const viewedChapterIds = new Set(Object.keys(this.progress.chapters));
    const completedChapterIds = new Set(
      Object.entries(this.progress.chapters)
        .filter(([, c]) => c.completed)
        .map(([id]) => id)
    );

    for (const chapter of CHAPTERS) {
      // Skip already completed chapters
      if (completedChapterIds.has(chapter.id)) continue;

      // Check if prerequisites are met
      const prerequisitesMet = !chapter.prerequisites ||
        chapter.prerequisites.every(prereq => viewedChapterIds.has(prereq));

      if (prerequisitesMet) {
        // Determine priority and reason
        let priority: 'high' | 'medium' | 'low' = 'medium';
        let reason = '';

        if (!viewedChapterIds.has(chapter.id)) {
          // Never viewed - recommend based on order
          if (chapter.order === 0 ||
              (chapter.prerequisites && chapter.prerequisites.every(p => completedChapterIds.has(p)))) {
            priority = 'high';
            reason = chapter.prerequisites
              ? `Ready to start after completing ${chapter.prerequisites.map(p => CHAPTERS.find(c => c.id === p)?.title).join(', ')}`
              : 'Start here';
          } else {
            reason = 'Available to explore';
          }
        } else {
          // Viewed but not completed
          const chapterProgress = this.progress.chapters[chapter.id];
          priority = 'high';
          reason = `Continue reading (${chapterProgress.viewCount} visit${chapterProgress.viewCount > 1 ? 's' : ''})`;
        }

        recommendations.push({
          chapterId: chapter.id,
          title: chapter.title,
          reason,
          priority,
        });
      }
    }

    // Sort by priority (high first) and then by order
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      const aOrder = CHAPTERS.find(c => c.id === a.chapterId)?.order || 0;
      const bOrder = CHAPTERS.find(c => c.id === b.chapterId)?.order || 0;
      return aOrder - bOrder;
    });
  }

  /**
   * Get chapter definition by ID.
   */
  getChapterDefinition(chapterId: string): ChapterDefinition | undefined {
    return CHAPTERS.find(c => c.id === chapterId);
  }

  /**
   * Get all chapter definitions.
   */
  getAllChapters(): ChapterDefinition[] {
    return CHAPTERS;
  }

  /**
   * Check if a chapter has been viewed.
   */
  hasViewedChapter(chapterId: string): boolean {
    return !!this.progress?.chapters[chapterId];
  }

  /**
   * Check if a chapter is completed.
   */
  isChapterCompleted(chapterId: string): boolean {
    return !!this.progress?.chapters[chapterId]?.completed;
  }

  /**
   * Reset all progress.
   */
  resetProgress(): void {
    this.initializeProgress();
  }

  /**
   * Export progress data.
   */
  exportProgress(): string {
    return JSON.stringify(this.progress, null, 2);
  }

  /**
   * Import progress data.
   */
  importProgress(data: string): boolean {
    try {
      const imported = JSON.parse(data) as UserProgress;
      if (imported.userId && imported.chapters) {
        this.progress = imported;
        this.saveProgress();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const progressTracker = new ProgressTracker();

// Export class for custom instances
export { ProgressTracker, CHAPTERS };
