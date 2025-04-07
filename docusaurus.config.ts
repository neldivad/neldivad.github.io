import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const title = 'Nelstudio';
const organizationName = 'neldivad';
const projectName = 'neldivad.github.io';
const deploymentBranch = 'gh-pages';

const tagline = "Hi, I'm David Len. I'm a software developer, music producer, and I do stuff.";

const gh_url = `https://github.com/${organizationName}`;
const yt_url = `https://www.youtube.com/@justneldivad?sub_confirmation=1`;
const xtwitter_url = `https://twitter.com/divadlenMusic`;
const kofi_url = `https://ko-fi.com/justneldivad`;


const config: Config = {
  title: title,
  staticDirectories: ['public', 'static'],
  tagline: tagline,
  favicon: 'img/n-mark-color.png',

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
  onBrokenLinks: 'throw',
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
    // Replace with your project's social card
    image: 'img/n-mark-color.png',
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
        src: 'img/n-mark-color.png',
      },
      items: [
        {
          to: '/blog', 
          label: 'Blog', 
          position: 'left'
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },

        // partners
        {
          type: 'doc',
          docsPluginId: 'partners',
          docId: 'overview',
          position: 'left',
          label: 'Partners',
        },
        
        //
        {
          label: 'About',
          position: 'right',
          items: [
            {
              label: 'Youtube',
              href: yt_url,
            },
            {
              label: 'GitHub',
              href: gh_url,
            },
            {
              label: 'Collab',
              to: 'collab',
            },
            {
              label: 'Shop',
              href: kofi_url,
            },
            {
              label: 'About Me',
              to: 'about',
            }
          ],
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
          items: [
            {
              label: 'Discord (coming soon)',
              href: '/',
            },
            {
              label: 'X',
              href: xtwitter_url,
            },
            {
              label: 'GitHub',
              href: gh_url,
            },
            {
              label: 'Youtube',
              href: yt_url,
            },
          ],
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

    // partners docs plugin
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'partners',  // Unique identifier for this documentation section
        path: 'partners',  // The path to the partners documentation directory
        routeBasePath: 'partners',  // The URL base for the partners docs (e.g., /partners)
        sidebarPath: require.resolve('./sidebars.js'),  // Path to the sidebar configuration for the partners docs
      },
    ],

  ]

    // partners docs
};



export default config;
