import { defineUserConfig } from "vuepress";
import { getDirname, path } from "@vuepress/utils";
import i18nPlugin from "vuepress-plugin-i18n";
import searchPlugin from "@vuepress/plugin-search";
import shikiPlugin from "@vuepress/plugin-shiki";
import theme from "./theme.js";

const __dirname = getDirname(import.meta.url);
export default defineUserConfig({
  lang: "en-US",
  title: "Core-JS",
  description: "Modular standard library for JavaScript",
  locales: {
    "/": {
      lang: "en-US",
    },
    "/zh/": {
      lang: "zh-CN",
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
  ],
  //debug: true,
});
