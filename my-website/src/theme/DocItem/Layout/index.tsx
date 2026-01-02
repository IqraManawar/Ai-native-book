/**
 * DocItem Layout wrapper to track chapter views for progress tracking.
 * Swizzled from @theme/DocItem/Layout
 */

import React, { useEffect } from 'react';
import Layout from '@theme-original/DocItem/Layout';
import type LayoutType from '@theme/DocItem/Layout';
import type { WrapperProps } from '@docusaurus/types';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { progressTracker } from '@site/src/services/progressTracker';

type Props = WrapperProps<typeof LayoutType>;

export default function LayoutWrapper(props: Props): JSX.Element {
  const { metadata } = useDoc();
  const { id, title } = metadata;

  useEffect(() => {
    // Track chapter view when component mounts
    if (id && typeof window !== 'undefined') {
      // Extract chapter ID from the doc ID
      // e.g., "chapter-1-physical-ai/index" -> "chapter-1-physical-ai"
      // or "intro" -> "intro"
      const chapterId = id.includes('/') ? id.split('/')[0] : id;

      progressTracker.trackChapterView(chapterId, title);
    }
  }, [id, title]);

  return <Layout {...props} />;
}
