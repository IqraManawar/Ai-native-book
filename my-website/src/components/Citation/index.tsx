import React from 'react';
import styles from './styles.module.css';

export interface CitationData {
  chapter_title: string;
  section_title: string;
  url: string;
  snippet?: string;
}

interface CitationProps {
  citation: CitationData;
  index?: number;
}

export default function Citation({ citation, index }: CitationProps): JSX.Element {
  return (
    <a
      href={citation.url}
      className={styles.citation}
      title={citation.snippet || `View in ${citation.chapter_title}`}
    >
      {index !== undefined && (
        <span className={styles.index}>[{index + 1}]</span>
      )}
      <span className={styles.chapter}>{citation.chapter_title}</span>
      {citation.section_title && (
        <span className={styles.section}>› {citation.section_title}</span>
      )}
    </a>
  );
}

interface CitationListProps {
  citations: CitationData[];
  label?: string;
}

export function CitationList({ citations, label = 'Sources' }: CitationListProps): JSX.Element | null {
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className={styles.citationList}>
      <span className={styles.label}>{label}:</span>
      <div className={styles.citations}>
        {citations.map((citation, idx) => (
          <Citation key={idx} citation={citation} index={idx} />
        ))}
      </div>
    </div>
  );
}
