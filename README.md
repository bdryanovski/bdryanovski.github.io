# DevNotes

### Code Highlighting

Since the underlying theme ships with [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer) and [react-live](https://github.com/FormidableLabs/react-live) certain additional features were added to code blocks. You can find an overview / usage example in the [example repository](https://github.com/LekoArts/gatsby-themes/tree/master/examples/minimal-blog/content/posts/fantastic-beasts-and-where-to-find-them/index.mdx)! If you want to change certain code styles or add additional language tabs, you need to shadow the file `src/@lekoarts/gatsby-theme-minimal-blog/styles/code.js`.

**Language tabs:**

When you add a language (such as e.g. `js` or `javascript`) to the code block, a little tab will appear at the top left corner.

````
```js
// code goes here
```
````

**Code titles:**

You can display a title (e.g. the file path) above the code block.

````
```jsx:title=your-title
// code goes here
```
````

Or without a specific language:

````
```:title=your-title
// code goes here
```
````

**Line highlighting:**

You can highlight single or multiple (or both) lines in a code block. You need to add a language.

````
```js {2,4-5}
const test = 3
const foo = 'bar'
const harry = 'potter'
const hermione = 'granger'
const ron = 'weasley'
```
````

**Hide line numbers:**

If you want to hide line numbers you can either globally disable them (see Theme options) or on a block-by-block basis. You can also combine that with the other attributes.

````
```noLineNumbers
// code goes here
```
````

**react-live:**

Add `react-live` to the code block (and render the component) to see a preview below it.

````
```js react-live
const onClick = () => {
  alert("You opened me");
};
render(<button onClick={onClick}>Alohomora!</button>);
```
````

**Frontmatter reference:**

```md
---
title: Introduction to "Defence against the Dark Arts"
date: 2019-11-07
description: Defence Against the Dark Arts (abbreviated as DADA) is a subject taught at Hogwarts School of Witchcraft and Wizardry and Ilvermorny School of Witchcraft and Wizardry.
tags:
  - Tutorial
  - Dark Arts
banner: ./defence-against-the-dark-arts.jpg
---
```

**The fields `description` and `banner` are optional!** If no description is provided, an excerpt of the blog post will be used. If no banner is provided, the default `siteImage` (from `siteMetadata`) is used.

The `date` field has to be written in the format `YYYY-MM-DD`!

#### Adding a new page

Additional pages can be created by placing MDX files inside `contents/pages`, e.g. an "About" or "Contact" page. You'll manually need to link to those pages, for example by adding them to the navigation (in `navigation` option of the theme). General instructions:

1. Create a new folder inside `content/pages`
1. Create a new `index.mdx` file, and add the frontmatter
1. Write your content below the frontmatter
1. Optionally add files/images to the folder you want to reference from the page

**Frontmatter reference:**

```md
---
title: About
slug: "/about"
---
```
