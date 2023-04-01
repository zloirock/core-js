import { sidebar } from "vuepress-theme-hope";

export const sidebarEn = sidebar({
  "/": [
    {
      text: "Guide",
      icon: "creative",
      prefix: "guide/",
      children: "structure",
      collapsible: true,
    },
    {
      text: "Features",
      icon: "object",
      prefix: "features/",
      children: [
        {
          text: "Overview",
          icon: "info",
          link: "README.md",
        },
        {
          text: "Missing Polyfills",
          icon: "notice",
          link: "missing-polyfills.md",
        },
        {
          text: "ES Standards",
          icon: "javascript",
          prefix: "es-standard/",
          children: "structure",
          collapsible: true,
        },
        {
          text: "ES Proposals",
          icon: "proposal",
          prefix: "es-proposal/",
          children: "structure",
          collapsible: true,
        },
        {
          text: "Web Standards",
          icon: "link",
          prefix: "web-standard/",
          children: "structure",
          collapsible: true,
        },
        {
          text: "Helpers",
          icon: "function",
          prefix: "helper/",
          children: "structure",
          collapsible: true,
        },
      ],
      collapsible: true,
    },
    {
      text: "Contribution",
      icon: "tree",
      prefix: "dev/",
      children: [
        {
          text: "How to contribute",
          icon: "question",
          link: "README.md",
        },
        {
          text: "Add a new polyfill",
          icon: "code",
          link: "polyfill.md",
        },
        {
          text: "Testing",
          icon: "check",
          link: "testing.md",
        },
        {
          text: "Update core-js-compat",
          icon: "form",
          link: "compat.md",
        },
        {
          text: "Writing documents",
          icon: "form",
          prefix: "docs/",
          children: [
            {
              text: "Writing documents",
              icon: "form",
              link: "README.md",
            },
            {
              text: "Create doc for polyfill",
              icon: "code",
              link: "polyfill.md",
            },
            {
              text: "Translate",
              icon: "language",
              link: "translate.md",
            },
          ],
          collapsible: true,
        },
      ],
      collapsible: true,
    },
    {
      text: "Project",
      icon: "more",
      prefix: "project/",
      children: "structure",
      collapsible: true,
    },
    {
      text: "Sponsor",
      icon: "like",
      link: "donate.md",
    },
  ],
});
