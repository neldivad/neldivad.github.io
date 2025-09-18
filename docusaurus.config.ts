import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const title = 'Nelverse';
const organizationName = 'neldivad';
const projectName = 'neldivad.github.io';
const deploymentBranch = 'gh-pages';

const tagline = "Hi, I'm David Len. I'm a software developer, music producer, and I do stuff.";

const spotify_url = `https://open.spotify.com/artist/0IemFhBfgnPjX9lSfaI8GN`;
const gh_url = `https://github.com/${organizationName}`;
const yt_url = `https://www.youtube.com/@nelvOfficial?sub_confirmation=1`;
const xtwitter_url = `https://twitter.com/nelvOfficial`;
const kofi_url = `https://ko-fi.com/justneldivad`;
const main_url = `https://www.nelworks.com`;

const nav_items = [
  {
    label: 'Twitter',
    href: xtwitter_url,
  },
  {
    label: 'Spotify',
    href: spotify_url,
  },
  {
    label: 'Youtube',
    href: yt_url,
  },
  {
    label: 'GitHub',
    href: gh_url,
  },
  {
    label: 'About Me',
    to: 'about',
  },
  {
    label: 'Collab',
    to: 'collab',
  },
  {
    label: 'Work/Business',
    href: main_url,
  },
] 


const config: Config = {
  title: title,
  staticDirectories: ['public', 'static'],
  tagline: tagline,
  favicon: 'img/Nel2_neutralspeak.ico',

  // Set the production url of your site here
  url: `https://${organizationName}.github.io`,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: `/`,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  projectName: `${projectName}`, // project name is my repo dir, if I add, url will be : https://neldivad.github.io/nelstudio-docs/ 
  organizationName: organizationName, 
  deploymentBranch: deploymentBranch,
  trailingSlash: false,
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          breadcrumbs: true,
          showLastUpdateTime: true,
          editCurrentVersion: true,
          editUrl: ({versionDocsDirPath, docPath}) =>
            `https://github.com/${organizationName}/${projectName}/tree/main/${versionDocsDirPath}/${docPath}`
        },
        
        // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog
        blog: {
          postsPerPage: 5,
          blogSidebarTitle: 'Recent posts',
          blogSidebarCount: 'ALL',
          showLastUpdateTime: true,
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Remove this to remove the "edit this page" links.
          editUrl:
            `https://github.com/${organizationName}/${projectName}/tree/main/`,
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card (used for OG/Twitter cards)
    image: 'img/Nel2_neutralspeak.ico',
    // Global <meta> tags
    metadata: [
      {name: 'keywords', content: 'software development, music production, programming tutorials, web development, React, TypeScript, business analysis, data science, probability calculators, gacha analysis, A/B testing, David Len, nelverse'},
      {name: 'description', content: 'David Len\'s personal website featuring software development insights, music production tutorials, interactive tools, and business analysis. Explore coding projects, probability calculators, and creative content.'},
      {name: 'author', content: 'David Len'},
      {name: 'robots', content: 'index, follow'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:site', content: '@nelvOfficial'},
      {name: 'twitter:creator', content: '@nelvOfficial'},
    ],
    // Additional tags in <head>
    headTags: [
      {
        tagName: 'script',
        
        attributes: { type: 'application/ld+json' },
        // Basic Organization schema for richer snippets
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Nelverse',
          url: 'https://neldivad.github.io/',
          sameAs: [
            'https://github.com/neldivad',
            'https://twitter.com/nelvOfficial',
            'https://www.youtube.com/@nelvOfficial',
            'https://open.spotify.com/artist/0IemFhBfgnPjX9lSfaI8GN',
          ],
          logo: 'https://neldivad.github.io/img/logo-no-slogan-no-bg.png',
        }),
      },
    ],
    // Note: sitemap plugin is included by preset-classic. Configure via preset if needed.
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    blog: {
      sidebar: {
      },
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: title,
      logo: {
        alt: `${title} Logo`,
        src: 'img/Nel2_neutralspeak.ico',
      },
      items: [
        {
          to: '/blog', 
          label: 'Blog', 
          position: 'left'
        },
        {
          to: '/IDTYU', 
          label: 'IDTYU', 
          position: 'left',
        },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'tutorialSidebar',
        //   position: 'left',
        //   label: 'Documentation',
        // },

        // labs
        {
          type: 'doc',
          label: 'Labs',
          position: 'left',
          docsPluginId: 'labs',
          docId: 'labs-intro',
        },

        // partners
        {
          type: 'doc',
          docsPluginId: 'partners',
          docId: 'partners-intro',
          position: 'left',
          label: 'Partners',
        },
        
        //
        {
          label: 'About',
          position: 'right',
          items: nav_items,
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Help',
          items: [
            {
              label: 'Documentation',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
          ],
        },
        {
          title: 'Community',
          items: nav_items
        },
      ],
      copyright: `Copyright © 2024 - ${new Date().getFullYear()} ${title} Inc.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,

  // plugins 
  plugins: [
    // search bar
    require.resolve('docusaurus-lunr-search'),

    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'IDTYU', // Unique ID for the second blog
        routeBasePath: 'IDTYU', // The route path for the second blog
        path: 'IDTYU', // Path to the content directory for the second blog
        postsPerPage: 5,
        blogSidebarTitle: 'Recent posts',
        blogSidebarCount: 'ALL',
        showLastUpdateTime: true,
        showReadingTime: true,
        feedOptions: {
          type: ['rss', 'atom'],
          xslt: true,
        },
        // Remove this to remove the "edit this page" links.
        editUrl:
          `https://github.com/${organizationName}/${projectName}/tree/main/`,
        // Useful options to enforce blogging best practices
        onInlineTags: 'warn',
        onInlineAuthors: 'warn',
        onUntruncatedBlogPosts: 'warn',
      },
    ],

    // labs docs plugin
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'labs',  // Unique identifier for this documentation section
        path: 'labs',  // The path to the labs documentation directory
        routeBasePath: 'labs',  // The URL base for the labs docs (e.g., /labs)
        sidebarCollapsible: true,
      },
    ],

    // partners docs plugin
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'partners',  // Unique identifier for this documentation section
        path: 'partners',  // The path to the partners documentation directory
        routeBasePath: 'partners',  // The URL base for the partners docs (e.g., /partners)
        // sidebarPath: './sidebars.ts',  // Path to the sidebar configuration for the partners docs
        sidebarCollapsible: true,
      },
    ],

  ]

    // partners docs
};



export default config;
