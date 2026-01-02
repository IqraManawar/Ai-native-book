import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Type for the search plugin options
type SearchPluginOptions = {
  hashed: boolean;
  language: string[];
  indexDocs: boolean;
  indexBlog: boolean;
  indexPages: boolean;
  docsRouteBasePath: string;
  highlightSearchTermsOnTargetPage: boolean;
  searchResultLimits: number;
  searchResultContextMaxLength: number;
  explicitSearchResultPath: boolean;
};

const config: Config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'An AI-Native Textbook',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://iqramanawar.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/Ai-native-book/',

  // GitHub pages deployment config.
  organizationName: 'IqraManawar', // GitHub org/user name.
  projectName: 'Ai-native-book', // GitHub repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Internationalization configuration
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ur'],
    localeConfigs: {
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
      ur: {
        label: 'اردو',
        direction: 'rtl',
        htmlLang: 'ur-PK',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl: 'https://github.com/IqraManawar/Ai-native-book/tree/main/my-website/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en'],
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
        searchResultContextMaxLength: 50,
        explicitSearchResultPath: true,
      } as SearchPluginOptions,
    ],
  ],

  themeConfig: {
    // Social card image
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Physical AI Textbook',
      logo: {
        alt: 'Physical AI Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Chapters',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/IqraManawar/Ai-native-book',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Textbook',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
            {
              label: 'Chapter 1: Physical AI',
              to: '/docs/chapter-1-physical-ai',
            },
            {
              label: 'Chapter 2: Humanoid Robotics',
              to: '/docs/chapter-2-humanoid-robotics',
            },
          ],
        },
        {
          title: 'More Chapters',
          items: [
            {
              label: 'Chapter 3: ROS 2',
              to: '/docs/chapter-3-ros2',
            },
            {
              label: 'Chapter 4: Digital Twin',
              to: '/docs/chapter-4-digital-twin',
            },
            {
              label: 'Chapter 5: VLA Systems',
              to: '/docs/chapter-5-vla-systems',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Capstone Project',
              to: '/docs/chapter-6-capstone',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/IqraManawar/Ai-native-book',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Essentials. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'bash', 'json', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
