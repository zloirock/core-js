---
category: development
icon: article
---

# Writing documents

The documentation is under active construction. If you want to help, you can start with the following:

- Refining examples of polyfill (find pages with missing examples [here](/tag/missing-example))
- Writing tutorials (e.g. integration with a tool)
- Help with translations (see [Translate](./translate.md) page)

## How to

> Documents are located in /docs in the repository

First, clone this repo and install dependence with npm

```sh
git clone https://github.com/zloirock/core-js.git
cd core-js
npm i
```

Then run `docs:dev` to start the development server

```sh
npm run docs:dev
```

Server will start on [localhost:8080](http://localhost:8080)

:::tip
The documentation system provides a number of useful enhancements to the syntax, see docs of [vuepress](https://v2.vuepress.vuejs.org/guide/markdown.html) and [vuepress-theme-hope](https://theme-hope.vuejs.press/guide/markdown/)
:::
