---
category: development
icon: article
---

# 撰写文档

文档正在积极构建中，如果你乐意帮忙，可以从以下几个方面入手：

- 为缺少示例的 polyfill（可以在 [这里](/zh/tag/missing-example) 找到）编写示例
- 编写教程（如与某个工具的集成）
- 帮助翻译（参见 [翻译文档](./translate.md) 页面）

## 使用指南

> 注：文档位于存储库的 `/docs` 下

先克隆存储库并使用 npm 安装依赖：

```sh
git clone https://github.com/zloirock/core-js.git
cd core-js
npm i
```

运行 `docs:dev` 以启动本地开发服务器

```sh
npm run docs:dev
```

打开 [localhost:8080](http://localhost:8080) 即可实时看到修改

:::tip
文档系统提供了很多扩展语法，参见 [vuepress](https://v2.vuepress.vuejs.org/guide/markdown.html) 和 [vuepress-theme-hope](https://theme-hope.vuejs.press/guide/markdown/) 的文档。
:::
