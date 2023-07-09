---
icon: language
---

# 翻译

## 翻译现有文章

::: warning

:::

:::tip
对于还未完成翻译的文章，你可以添加 tag `untranslated` 用作标识
:::

1. 将根目录下的原文复制到`/zh/`下
2. 进行翻译（切勿直接机翻）

## 翻译规范

为保证文档格式的一致性，下面列出了一些要求:

- 不要翻译文件名、分类和标签

- 同时请参考并遵循以下规范:
  - [MDN 翻译规范](https://github.com/mdn/translated-content/blob/main/docs/zh-cn/translation-guide.md#%E4%B8%AD%E6%96%87%E7%BF%BB%E8%AF%91%E7%9A%84%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)
  - [中文技术文档的写作规范](https://github.com/ruanyf/document-style-guide)

## 翻译为新语言

1. 在配置文件中添加新的 locale：

   1. 复制一份 `.vuepress/navbar/en.ts` 并命名为 `.vuepress/navbar/lang.ts`，给所有的 `link` 加上路径前缀（`/lang`），然后翻译 `text` 的内容：
      :::details 示例
      :::tabs#example
      @tab en.ts
      @[code ts](@docs-root/.vuepress/navbar/en.ts)
      @tab zh.ts
      @[code ts](@docs-root/.vuepress/navbar/zh.ts)
      :::

   2. 复制一份 `.vuepress/sidebar/en.ts` 并命名为 `.vuepress/sidebar/lang.ts`，将第四行的 `"/"` 替换为 `"/lang"`，然后翻译 `text` 的内容：
      :::details 示例
      :::tabs#example
      @tab en.ts
      @[code ts](@docs-root/.vuepress/sidebar/en.ts)
      @tab zh.ts
      @[code ts](@docs-root/.vuepress/sidebar/zh.ts)
      :::

   3. 在`.vuepress/config.ts` 的 `locales` 一栏新增一项：
      :::details 示例
      @[code ts{15-17}](@docs-root/.vuepress/config.ts)
      :::
   4. 在`.vuepress/theme.ts`导入刚才创建的 navbar 和 sidebar，并将它们添加到主题设置的 `locales` 一栏：
      :::details 示例
      @[code ts{2-3,14-17}](@docs-root/.vuepress/theme.ts)
      :::

2. 翻译文档正文
