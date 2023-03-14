---
icon: translate
---

# Translate

## Translate articals

::: warning
Don't use the machine translation directly!
:::
You can find the pending translate pages by tag `untranslated` in each language:

- [中文(Chinese)](/zh/tag/untranslated)

### Specification

To ensure consistency in the format of the document, some of the requirements are listed below:

- Please do not translate file names, categories and tags
- See also the corresponding language specification

## Translate to new language

1. Copy all documents into `/lang/`
2. Add localised configuration:

   1. Copy `.vuepress/navbar/en.ts` and name it `.vuepress/navbar/lang.ts`, add prefix `/lang` for all `link` and translate the contents of `text`:
      :::details Example
      :::tabs#example
      @tab en.ts
      @[code ts](@docs-root/.vuepress/navbar/en.ts)
      @tab zh.ts
      @[code ts](@docs-root/.vuepress/navbar/zh.ts)
      :::

   2. Copy `.vuepress/sidebar/en.ts` and name it `.vuepress/sidebar/lang.ts`, replace `"/"` in line4 to `"/lang/` and translate the contents of `text`:
      :::details Example
      :::tabs#example
      @tab en.ts
      @[code ts](@docs-root/.vuepress/sidebar/en.ts)
      @tab zh.ts
      @[code ts](@docs-root/.vuepress/sidebar/zh.ts)
      :::

   3. Add the language to `locales` field in `.vuepress/config.ts`:
      :::details Example
      @[code ts{15-17}](@docs-root/.vuepress/config.ts)
      :::
   4. Import the navbar&sidebar and add the language to `locales` field in `.vuepress/theme.ts`:
      :::details Example
      @[code ts{2-3,14-17}](@docs-root/.vuepress/theme.ts)
      :::

3. Translate the content of the document
   :::tip
   You can add the `untranslated` tag to the parts that are not translated at the moment
   :::
