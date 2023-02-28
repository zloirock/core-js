import { navbar } from "vuepress-theme-hope";

export const navbarEn = navbar([
  {
    text: "Guide",
    link: "/guide/",
    icon: "creative",
  },
  {
    text: "Develop",
    link: "/dev/",
    icon: "debug",
  },
  {
    text: "Compat Data",
    link: "/compat.md",
    icon: "form",
  },
  {
    text: "About",
    prefix: "/about/",
    icon: "more",
    children: [
      {
        text: "This project",
        icon: "info",
        link: "README.md",
      },
      {
        text: "Changelog",
        icon: "time",
        link: "changelog.md",
      },
    ],
  },
  {
    text: "Blog",
    link: "/blog/",
    icon: "blog",
  },
  {
    text: "Sponsor",
    link: "/donate.md",
    icon: "like",
  },
]);
