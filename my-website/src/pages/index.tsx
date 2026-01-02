import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import { RecommendedNext } from '@site/src/components/ProgressDashboard';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Start Learning
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  emoji: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Physical AI Fundamentals',
    emoji: '🤖',
    description: (
      <>
        Learn the foundations of AI systems that interact with the physical world,
        from sensors to actuators and everything in between.
      </>
    ),
  },
  {
    title: 'Humanoid Robotics',
    emoji: '🦾',
    description: (
      <>
        Explore bipedal locomotion, manipulation, and the engineering challenges
        of building human-like robots.
      </>
    ),
  },
  {
    title: 'ROS 2 & Digital Twins',
    emoji: '🔧',
    description: (
      <>
        Master the Robot Operating System 2 framework and create digital twins
        for simulation and testing.
      </>
    ),
  },
];

function Feature({title, emoji, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <span className={styles.featureEmoji} role="img">{emoji}</span>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ChapterOverview(): ReactNode {
  const chapters = [
    { id: 'chapter-1-physical-ai', title: 'Chapter 1: Physical AI Fundamentals', desc: 'Introduction to embodied AI systems' },
    { id: 'chapter-2-humanoid-robotics', title: 'Chapter 2: Humanoid Robotics', desc: 'Building human-like robots' },
    { id: 'chapter-3-ros2', title: 'Chapter 3: ROS 2 Framework', desc: 'Robot Operating System 2' },
    { id: 'chapter-4-digital-twin', title: 'Chapter 4: Digital Twin Technology', desc: 'Simulation and virtual testing' },
    { id: 'chapter-5-vla-systems', title: 'Chapter 5: Vision-Language-Action', desc: 'Multimodal AI for robotics' },
    { id: 'chapter-6-capstone', title: 'Chapter 6: Capstone Project', desc: 'Build your own robot system' },
  ];

  return (
    <section className={styles.chapters}>
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--lg">
          Chapters
        </Heading>
        <div className={styles.chapterGrid}>
          {chapters.map((chapter, idx) => (
            <Link
              key={chapter.id}
              to={`/docs/${chapter.id}`}
              className={styles.chapterCard}
            >
              <span className={styles.chapterNumber}>{idx + 1}</span>
              <div>
                <strong>{chapter.title.replace(/Chapter \d+: /, '')}</strong>
                <p>{chapter.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="AI-Native Textbook for Physical AI and Humanoid Robotics">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <section className={styles.recommendedSection}>
          <div className="container">
            <RecommendedNext />
          </div>
        </section>
        <ChapterOverview />
      </main>
    </Layout>
  );
}
