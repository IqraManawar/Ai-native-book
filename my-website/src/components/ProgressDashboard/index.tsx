/**
 * ProgressDashboard - User learning progress visualization.
 */

import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import {
  progressTracker,
  type UserProgress,
  type Recommendation,
  type ChapterProgress,
  type Bookmark,
} from '../../services/progressTracker';
import styles from './styles.module.css';

interface ProgressDashboardProps {
  showRecommendations?: boolean;
  showStats?: boolean;
  showBookmarks?: boolean;
  compact?: boolean;
}

export default function ProgressDashboard({
  showRecommendations = true,
  showStats = true,
  showBookmarks = true,
  compact = false,
}: ProgressDashboardProps): JSX.Element | null {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const userProgress = progressTracker.getProgress();
    setProgress(userProgress);
    setRecommendations(progressTracker.getRecommendations());
  }, []);

  // Refresh progress periodically
  useEffect(() => {
    if (!isClient) return;

    const interval = setInterval(() => {
      setProgress(progressTracker.getProgress());
      setRecommendations(progressTracker.getRecommendations());
    }, 5000);

    return () => clearInterval(interval);
  }, [isClient]);

  if (!isClient || !progress) {
    return null;
  }

  const completionPercentage = progressTracker.getCompletionPercentage();
  const viewedCount = progressTracker.getViewedChaptersCount();
  const totalChapters = progressTracker.getAllChapters().length;
  const totalTime = progressTracker.getTotalTimeSpent();
  const formattedTime = progressTracker.formatTimeSpent(totalTime);

  const handleRemoveBookmark = (bookmarkId: string) => {
    progressTracker.removeBookmark(bookmarkId);
    setProgress(progressTracker.getProgress());
  };

  const handleToggleComplete = (chapterId: string) => {
    if (progressTracker.isChapterCompleted(chapterId)) {
      progressTracker.markChapterIncomplete(chapterId);
    } else {
      progressTracker.markChapterCompleted(chapterId);
    }
    setProgress(progressTracker.getProgress());
    setRecommendations(progressTracker.getRecommendations());
  };

  if (compact) {
    return (
      <div className={styles.compactDashboard}>
        <div className={styles.compactStats}>
          <span className={styles.compactStat}>
            <strong>{completionPercentage}%</strong> complete
          </span>
          <span className={styles.compactStat}>
            <strong>{viewedCount}</strong>/{totalChapters} chapters
          </span>
          <span className={styles.compactStat}>
            <strong>{formattedTime}</strong> reading
          </span>
        </div>
        {recommendations.length > 0 && (
          <div className={styles.compactRecommendation}>
            <span>Next: </span>
            <Link to={`/docs/${recommendations[0].chapterId}`}>
              {recommendations[0].title}
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Progress Stats */}
      {showStats && (
        <div className={styles.statsSection}>
          <h3 className={styles.sectionTitle}>Your Progress</h3>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{completionPercentage}%</span>
              <span className={styles.statLabel}>Complete</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{viewedCount}/{totalChapters}</span>
              <span className={styles.statLabel}>Chapters Viewed</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{formattedTime}</span>
              <span className={styles.statLabel}>Time Reading</span>
            </div>
          </div>

          {/* Chapter Checklist */}
          <div className={styles.chapterList}>
            {progressTracker.getAllChapters().map((chapter) => {
              const chapterProgress = progress.chapters[chapter.id];
              const isCompleted = chapterProgress?.completed ?? false;
              const isViewed = !!chapterProgress;

              return (
                <div key={chapter.id} className={styles.chapterItem}>
                  <button
                    className={`${styles.checkbox} ${isCompleted ? styles.checked : ''}`}
                    onClick={() => isViewed && handleToggleComplete(chapter.id)}
                    disabled={!isViewed}
                    title={isViewed ? 'Toggle completion' : 'Not yet viewed'}
                    aria-label={`Mark ${chapter.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
                  >
                    {isCompleted && '✓'}
                  </button>
                  <Link
                    to={`/docs/${chapter.id === 'intro' ? 'intro' : chapter.id}`}
                    className={`${styles.chapterLink} ${isCompleted ? styles.completed : ''}`}
                  >
                    {chapter.title}
                  </Link>
                  {chapterProgress && (
                    <span className={styles.chapterMeta}>
                      {chapterProgress.viewCount} view{chapterProgress.viewCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className={styles.recommendationsSection}>
          <h3 className={styles.sectionTitle}>Recommended Next</h3>
          <div className={styles.recommendationsList}>
            {recommendations.slice(0, 3).map((rec) => (
              <Link
                key={rec.chapterId}
                to={`/docs/${rec.chapterId === 'intro' ? 'intro' : rec.chapterId}`}
                className={`${styles.recommendationCard} ${styles[rec.priority]}`}
              >
                <span className={styles.recommendationTitle}>{rec.title}</span>
                <span className={styles.recommendationReason}>{rec.reason}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks */}
      {showBookmarks && progress.bookmarks.length > 0 && (
        <div className={styles.bookmarksSection}>
          <h3 className={styles.sectionTitle}>Your Bookmarks</h3>
          <div className={styles.bookmarksList}>
            {progress.bookmarks.map((bookmark: Bookmark) => (
              <div key={bookmark.id} className={styles.bookmarkItem}>
                <Link to={bookmark.url} className={styles.bookmarkLink}>
                  {bookmark.title}
                </Link>
                <button
                  className={styles.removeBookmark}
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                  title="Remove bookmark"
                  aria-label={`Remove bookmark: ${bookmark.title}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact recommendation widget for homepage.
 */
export function RecommendedNext(): JSX.Element | null {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setRecommendations(progressTracker.getRecommendations());
  }, []);

  if (!isClient || recommendations.length === 0) {
    return null;
  }

  const topRec = recommendations[0];

  return (
    <div className={styles.recommendedNext}>
      <h3>Continue Learning</h3>
      <Link
        to={`/docs/${topRec.chapterId === 'intro' ? 'intro' : topRec.chapterId}`}
        className={styles.continueButton}
      >
        <span className={styles.continueTitle}>{topRec.title}</span>
        <span className={styles.continueReason}>{topRec.reason}</span>
      </Link>
    </div>
  );
}
