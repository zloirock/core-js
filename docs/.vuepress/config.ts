import { defineUserConfig } from "vuepress";
import { getDirname, path } from "@vuepress/utils";
import i18nPlugin from "vuepress-plugin-i18n";
import searchPlugin from "@vuepress/plugin-search";
import shikiPlugin from "@vuepress/plugin-shiki";
import {redirectPlugin} from "vuepress-plugin-redirect";
import theme from "./theme.js";

const __dirname = getDirname(import.meta.url);
export default defineUserConfig({
  lang: "en-US",
  title: "Core-JS",
  description: "Modular standard library for JavaScript",
  locales: {
    "/en/": {
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
    i18nPlugin({ guideLink: "/dev/docs/translate.html" }),
    searchPlugin(),
    shikiPlugin({
      theme: "one-dark-pro",
    }),
    redirectPlugin({
      autoLocale: true,
      localeConfig: {
        "/en/": ["en-US", "en-UK", "en"],
        "/zh/": ["zh-CN", "zh-TW", "zh"]
      }
    })
  ],
  //debug: true,
});
