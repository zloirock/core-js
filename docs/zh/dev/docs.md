---
category: development
icon: article
tag:
  - waiting-for-translation
---

# 撰写文档

The documentation is under active construction. If you want to help, you can start with the following:

- Refining examples of polyfill (find pages with missing examples [here]())
- Writing tutorials (e.g. integration with a tool)
- Help with translations (see the Chinese article to be translated [here](/zh/tag/waiting-for-translation/), or submit a new language :smile:)

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

## Add doc for polyfill

1. Create a new file in `features/{type}/{name}.md`
2. The documentation should contain the following: module(s), types (`TypeScript`) and entry points
3. It is best to include a simple example to make it easier to understand
4. The following is a typical example:

@[code markdown](../features/es-standard/json.md)

## Translate articals

:::warning WARNING
Don't use the machine translation directly!
:::
You can find the pending translate pages by tag `waiting-for-translation`:

- [中文(Chinese)](/zh/tag/waiting-for-translation)

### Specification

To ensure consistency in the format of the document, some of the requirements are listed below

#### Chinese (中文)

请参考并遵循 MDN 的[翻译规范](https://github.com/mdn/translated-content/blob/main/docs/zh-cn/translation-guide.md#%E4%B8%AD%E6%96%87%E7%BF%BB%E8%AF%91%E7%9A%84%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)

## Translate to new language

1. Copy all documents in `/` to `/lang/`
2. Add localised configuration:

   1. Copy `.vuepress/navbar/en.ts` and name it `.vuepress/navbar/lang.ts`, add prefix to `link` and translate the contents of `text`:
      :::details Example
      :::tabs#example
      @tab en.ts
      @[code ts](../../.vuepress/navbar/en.ts)
      @tab zh.ts
      @[code ts](../../.vuepress/navbar/zh.ts)
      :::

   2. Copy `.vuepress/sidebar/en.ts` and name it `.vuepress/sidebar/lang.ts`, update the prefix and translate the contents of `text`:
      :::details Example
      :::tabs#example
      @tab en.ts
      @[code ts](../../.vuepress/sidebar/en.ts)
      @tab zh.ts
      @[code ts](../../.vuepress/sidebar/zh.ts)
      :::

   3. Add the language to `locales` field in `.vuepress/config.ts`:
      :::details Example
      @[code ts{15-17}](../../.vuepress/config.ts)
      :::
   4. Import the navbar&sidebar and add the language to `locales` field in `.vuepress/theme.ts`:
      :::details Example
      @[code ts{2-3,14-17}](../../.vuepress/theme.ts)
      :::

3. Translate the content of the document
   :::tip
   You can add the `waiting-for-translation` tag to the parts that are not translated at the moment
   :::
