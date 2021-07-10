require(`dotenv`).config({
  path: `.env`,
})

const newsletterFeed = require(`./src/utils/newsletterFeed`)
const withDefaults = require(`./src/utils/default-options`)
const config = require('./config');

const options = withDefaults(config)

module.exports = {
  siteMetadata: {
    siteTitle: `Developer Notes`,
    siteTitleAlt: `Developer notes on day-to-day task`,
    siteHeadline: `Developer notes on day-to-day task including snippets and small lifehacks`,
    siteUrl: `https://bdryanovski.github.io`,
    siteDescription: `Developer notes on may day-to-day tasks, snippets and reusable code.`,
    siteLanguage: `en`,
    siteImage: `/banner.jpg`,
    author: `@bdryanovski`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: options.postsPath,
        path: options.postsPath,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: options.pagesPath,
        path: options.pagesPath,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 960,
              quality: 90,
              linkImagesToOriginal: false,
            },
          },
        ],
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 960,
              quality: 90,
              linkImagesToOriginal: false,
            },
          },
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-typescript`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-typescript`,
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-theme-ui`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: process.env.GOOGLE_ANALYTICS_ID,
      },
    },
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Dev notes`,
        short_name: `devnotes`,
        description: `DevNotes on my day-to-day tasks - including blog posts, code snippets and more.`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#6B46C1`,
        display: `standalone`,
        icons: [
          {
            src: `/android-chrome-192x192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `/android-chrome-512x512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
        ],
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-netlify`,
    // {
    //   resolve: `gatsby-plugin-webpack-bundle-analyser-v2`,
    //   options: {
    //     analyzerMode: `static`,
    //     reportFilename: `_bundle.html`,
    //     openAnalyzer: false,
    //   },
    // },
    {
      resolve: `gatsby-plugin-feed`,
      options: newsletterFeed('DevNotes'),
    },
  ].filter(Boolean),
}
