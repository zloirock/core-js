import { defineUserConfig } from "vuepress";
import { getDirname, path } from "@vuepress/utils";
import i18nPlugin from "vuepress-plugin-i18n";
import { redirectPlugin } from "vuepress-plugin-redirect";
import searchPlugin from "@vuepress/plugin-search";
import shikiPlugin from "@vuepress/plugin-shiki";
import theme from "./theme.js";
import { version } from "../../packages/core-js/package.json";

const __dirname = getDirname(import.meta.url);
export default defineUserConfig({
  lang: "en-US",
  description: "Modular standard library for JavaScript",
  locales: {
    "/": {
      lang: "en-US",
      title: "Core-JS Document",
      description: "Modular standard library for JavaScript",
    },
    "/zh/": {
      lang: "zh-CN",
      title: "Core-JS 文档",
      description: "模块化 JavaScript 标准库",
    },
  },
  theme,
  alias: {
    "@compat-tests": () =>
      path.resolve(__dirname, "..", "..", "tests", "compat", "tests.js"),
  },
  markdown: {
    importCode: {
      handleImportPath: (str) =>
        str.replace(/^@docs-root/, path.resolve(__dirname, "..")),
    },
  },
  plugins: [
    i18nPlugin({
      translationGuide: "/dev/docs/translate.html",
      updatedTime: "file",
    }),
    searchPlugin(),
    shikiPlugin({
      theme: "one-dark-pro",
    }),
    redirectPlugin({
      localeConfig: {
        "/": ["en-US", "en-UK", "en"],
        "/zh/": ["zh-CN", "zh-TW", "zh"],
      },
      switchLocale: "modal",
    }),
  ],
  extendsPage: (page) => {
    if (page.sfcBlocks.template?.contentStripped)
      page.sfcBlocks.template.contentStripped =
        page.sfcBlocks.template.contentStripped.replaceAll(
          "%COREJS_VERSION%",
          version
        );
  },
});
