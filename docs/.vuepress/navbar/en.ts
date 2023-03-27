import { navbar } from "vuepress-theme-hope";

export const navbarEn = navbar([
  {
    text: "Guide",
    link: "/guide/",
    icon: "creative",
  },
  {
    text: "Features",
    icon: "object",
    prefix: "/features/",
    children: [
      {
        text: "ES Standards",
        link: "es-standard/README.md",
        icon: "javascript",
      },
      {
        text: "ES Proposals",
        link: "es-proposal/README.md",
        icon: "proposal",
      },
      {
        text: "Web Standards",
        link: "web-standard/README.md",
        icon: "link",
      },
      {
        text: "Helpers",
        link: "helper/README.md",
        icon: "function",
      },
    ],
  },
  {
    text: "Contribution",
    prefix: "/dev/",
    icon: "tree",
    children: [
      {
        text: "Guide",
        icon: "question",
        link: "README.md",
      },
      {
        text: "Polyfill",
        icon: "code",
        link: "polyfill.md",
      },
      {
        text: "Compat Data",
        icon: "form",
        link: "compat.md",
      },
      {
        text: "Documents",
        icon: "article",
        link: "docs/README.md",
      },
    ],
  },
  {
    text: "Project",
    icon: "more",
    children: [
      {
        text: "About",
        icon: "info",
        link: "/project/README.md",
      },
      {
        text: "Changelog",
        icon: "time",
        link: "/project/changelog.md",
      },
      {
        text: "Roadmap",
        link: "/project/roadmap.md",
        icon: "state",
      },
      {
        text: "Blog",
        link: "/category/blog/",
        icon: "blog",
      },
    ],
  },
  {
    text: "Compatibility",
    link: "/compat.md",
    icon: "form",
  },
  {
    text: "Sponsor",
    link: "/donate.md",
    icon: "like",
  },
]);