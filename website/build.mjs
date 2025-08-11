/* eslint-disable import/no-unresolved -- dependencies are not installed */
import fm from 'front-matter';
import { Marked } from 'marked';
import { gfmHeadingId, getHeadingList } from 'marked-gfm-heading-id';
import markedAlert from 'marked-alert';

const DOCS_DIR = 'docs/web/';
const BLOG_DIR = 'docs/web/blog/';
const RESULT_DIR = 'website/dist/';
const TEMPLATES_DIR = 'website/templates/';
const SRC_DIR = 'website/src/';
const TEMPLATE_PATH = `${ TEMPLATES_DIR }index.html`;
const DEFAULT_BRANCH = 'web';
const DEFAULT_VERSION = 'web';

const args = process.argv;
const lastArg = args.at(-1);
const BRANCH = lastArg.startsWith('branch=') ? lastArg.slice('branch='.length) : undefined;
const BASE = BRANCH ? `/branches/${ BRANCH }/` : '/';

async function getAllMdFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getAllMdFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function buildDocsMenu(item) {
  if (Object.hasOwn(item, 'children')) {
    let result = `<li class="collapsible"><a href="#">${ item.title }</a><ul>`;
    for (const child of item.children) {
      result += await buildDocsMenu(child);
    }
    result += '</ul></li>';
    return result;
  }

  return `<li><a href="${ item.url }" class="with-docs-version" data-default-version="${ DEFAULT_VERSION }">${ item.title }</a></li>`;
}

const docsMenus = [];
const docsMenuItems = [];

async function getDocsMenuItems(version) {
  if (docsMenuItems[version]) return docsMenuItems[version];

  echo(chalk.green(`Getting menu items from file for version: ${ version }`));
  const jsonPath = BRANCH ? `${ DOCS_DIR }docs/menu.json` : `${ DOCS_DIR }${ version }/docs/menu.json`;
  try {
    await fs.access(jsonPath);
  } catch {
    echo(chalk.yellow(`Menu JSON file not found: ${ jsonPath }`));
    return '';
  }
  const docsMenuJson = await readFile(jsonPath);
  try {
    docsMenuItems[version] = JSON.parse(docsMenuJson.toString());
  } catch {
    docsMenuItems[version] = [];
  }
  return docsMenuItems[version];
}

async function buildDocsMenuForVersion(version) {
  if (docsMenus[version]) return docsMenus[version];

  echo(chalk.green(`Building docs menu for version: ${ version }`));
  const docsMenu = await getDocsMenuItems(version);
  if (!docsMenu.length) return '';
  let menu = '<ul><li>{versions-menu}</li>';
  for (const item of docsMenu) {
    menu += await buildDocsMenu(item);
  }
  menu += '</ul>';
  docsMenus[version] = menu;
  return menu;
}

async function buildVersionsMenuList(versions, currentVersion) {
  let versionsMenuHtml = `<div class="dropdown-block"><a href="./docs/">${ DEFAULT_VERSION } (default)</a>`;
  if (versions.length > 1) {
    for (const v of versions) {
      const activityClass = v === currentVersion ? ' class="active"' : '';
      versionsMenuHtml += `<a href="./${ v }/docs/"${ activityClass }>${ v }</a>`;
    }
  }
  versionsMenuHtml += '</div>';

  return versionsMenuHtml;
}

async function buildVersionsMenu(versions, currentVersion) {
  const innerMenu = await buildVersionsMenuList(versions, currentVersion);

  return `<div class="dropdown versions-menu"><div class="dropdown-wrapper"><a href="#" class="current">${
    currentVersion }</a>${ innerMenu }</div><div class="backdrop"></div></div>`;
}

const markedInline = new Marked();

function metadata(markdown) {
  const { attributes, body } = fm(markdown);
  fileMetadata = {};
  for (const prop of Object.keys(attributes)) {
    fileMetadata[prop] = attributes[prop];
  }
  return body;
}

const linkRenderer = {
  link({ href, text }) {
    const htmlContent = markedInline.parseInline(text);
    const isExternal = /^https?:\/\//.test(href);
    const isAnchor = href.startsWith('#');
    if (isAnchor) href = htmlFileName.replace('.html', '') + href.toLowerCase();
    let html = `<a href="${ href }"`;
    if (isExternal) html += ' target="_blank"';
    html += `>${ htmlContent }</a>`;
    return html;
  },
};

function buildMenus(html) {
  const headings = getHeadingList().filter(({ level }) => level > 1);
  let result = '<div class="wrapper">';
  if (isBlog) {
    result += `<div class="docs-menu sticky">${ blogMenuCache }</div>`;
  } else if (isDocs) {
    result += `<div class="docs-menu sticky">${ docsMenu }</div>`;
  }
  result += `<div class="content">${ html }</div>`;
  if (headings.length && !Object.hasOwn(fileMetadata, 'disableContentMenu')) {
    result += `<div class="table-of-contents sticky">
          ${ headings.map(({ id, raw, level }) => `<div class="toc-link"><a href="${
            htmlFileName.replace('.html', '') }#${ id }" class="h${
            level } with-docs-version" data-default-version="${ DEFAULT_VERSION }">${
            raw }</a></div>`).join('\n') }
        </div>`;
  }
  return result;
}

const marked = new Marked();
marked.use(markedAlert());
marked.use({ hooks: { preprocess: metadata } });
marked.use({ renderer: linkRenderer });

let fileMetadata = {};
const markedWithContents = new Marked();
markedWithContents.use(markedAlert(), gfmHeadingId({ prefix: '' }));
markedWithContents.use({
  hooks: {
    preprocess: metadata,
    postprocess: buildMenus,
  },
  renderer: linkRenderer,
});

let blogMenuCache = '';

async function buildBlogMenu() {
  if (blogMenuCache !== '') return blogMenuCache;

  const mdFiles = await getAllMdFiles(BLOG_DIR);
  mdFiles.reverse();
  let index = '---\ndisableContentMenu: true\n---\n# Blog\n\n';
  let menu = '<ul>';
  for (const mdPath of mdFiles) {
    if (mdPath.endsWith('index.md')) continue;
    const mdContent = await readFile(mdPath);
    const content = mdContent.toString();
    const tokens = marked.lexer(content);
    marked.parse(content);
    const firstH1 = tokens.find(token => token.type === 'heading' && token.depth === 1);

    if (!firstH1) {
      echo(chalk.yellow(`H1 not found in ${ mdPath }`));
      continue;
    }

    const match = mdPath.match(/(?<date>\d{4}-\d{2}-\d{2})-/);
    const date = match && match.groups ? match.groups.date : null;
    const htmlFileName = mdPath.replace(BLOG_DIR, '').replace(/\.md$/i, '');
    menu += `<li><a href="./blog/${ htmlFileName }">${ date }: ${ firstH1.text }</a></li>`;
    index += `## [${ firstH1.text }](./blog/${
      htmlFileName })\n\n*${ date }*\n\n${ fileMetadata.preview ?? '' }\n\n`;
  }
  menu += '</ul>';
  blogMenuCache = menu;
  const blogIndexPath = path.join(BLOG_DIR, 'index.md');
  await fs.writeFile(blogIndexPath, index, 'utf8');
  echo(chalk.green(`File created: ${ blogIndexPath }`));

  return menu;
}

// eslint-disable-next-line no-unused-vars -- use it later
async function getVersionTags() {
  const tagsString = await $`git tag | grep -E "^v[4-9]\\.[0-9]+\\.[0-9]+$" | sort -V`;
  return tagsString.stdout.split('\n');
}

let versionsCache = [];

async function getVersionsFromMdFiles(mdFiles) {
  if (versionsCache.length) return versionsCache;

  const versions = [];
  for (const mdPath of mdFiles) {
    const match = mdPath.match(/\/web\/(?<version>[^/]+)\/docs\//);
    if (match && match.groups && match.groups.version) {
      versions.push(match.groups.version);
    } else {
      versions.push(DEFAULT_BRANCH);
    }
  }
  versionsCache = versions;

  return versions;
}

async function readFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return content.toString();
}

async function processPlaygroundFile(template) {
  const playgroundContent = await readFile(`${ SRC_DIR }playground.html`);
  let playground = template.replace('{content}', `${ playgroundContent }`);
  playground = playground.replace('{base}', `${ BASE }`);
  playground = playground.replace('{blog-menu}', '');
  playground = playground.replace('{docs-menu}', '');
  playground = playground.replace('{title}', 'Playground - ');
  playground = playground.replace('{base}', `${ BASE }`);
  const playgroundFilePath = path.join(RESULT_DIR, 'playground.html');
  await fs.mkdir(path.dirname(playgroundFilePath), { recursive: true });
  await fs.writeFile(playgroundFilePath, playground, 'utf8');

  echo(chalk.green(`File created: ${ playgroundFilePath }`));
}

async function createDocsIndexes(versions) {
  if (BRANCH) {
    const menuItems = await getDocsMenuItems(BRANCH);
    const firstDocPath = path.join(RESULT_DIR, `${ menuItems[0].url }.html`.replace('{docs-version}/', ''));
    const indexFilePath = path.join(RESULT_DIR, 'docs/', 'index.html');
    await fs.copy(firstDocPath, indexFilePath);
    echo(chalk.green(`File created: ${ indexFilePath }`));
    return;
  }

  for (const version of versions) {
    const menuItems = await getDocsMenuItems(version);
    const firstDocPath = path.join(RESULT_DIR, `${ menuItems[0].url }.html`.replace('{docs-version}', version));
    const indexFilePath = path.join(RESULT_DIR, `${ version }/docs/`, 'index.html');
    await fs.copy(firstDocPath, indexFilePath);
    echo(chalk.green(`File created: ${ indexFilePath }`));
  }
}

let htmlFileName = '';
let docsMenu = '';
let isBlog = false;
let isDocs = false;
let isChangelog;

async function build() {
  const template = await readFile(TEMPLATE_PATH);
  const blogMenuHtml = await buildBlogMenu();
  const mdFiles = await getAllMdFiles(DOCS_DIR);
  const versions = await getVersionsFromMdFiles(mdFiles);
  const uniqueVersions = [...new Set(versions)];

  let currentVersion = '';
  let versionsMenu = '';
  for (let i = 0; i < mdFiles.length; i++) {
    const mdPath = mdFiles[i];
    const mdContent = await readFile(mdPath);
    const content = mdContent.toString();
    isDocs = mdPath.includes('/docs');
    isChangelog = mdPath.includes('/changelog');
    isBlog = mdPath.includes('/blog');
    const match = /^# (?<title>.+)$/m.exec(content);
    const title = match && match.groups && match.groups.title ? `${ match.groups.title } - ` : '';

    let mobileDocsMenu = '';
    let mobileBlogMenu = '';
    if (currentVersion !== versions[i]) {
      currentVersion = versions[i];
      docsMenu = await buildDocsMenuForVersion(currentVersion);
      versionsMenu = await buildVersionsMenu(uniqueVersions, currentVersion);
    }
    if (isDocs) mobileDocsMenu = docsMenu;
    if (isBlog) mobileBlogMenu = blogMenuHtml;

    htmlFileName = mdPath.replace(DOCS_DIR, '').replace(/\.md$/i, '.html');
    const htmlFilePath = path.join(RESULT_DIR, htmlFileName);
    const htmlContent = isDocs || isBlog || isChangelog ? markedWithContents.parse(content) : marked.parse(content);

    let resultHtml = template.replace('{content}', `${ htmlContent.replaceAll('$', '&#36;') }`);

    resultHtml = resultHtml.replace('{title}', title);
    resultHtml = resultHtml.replace('{docs-menu}', `${ mobileDocsMenu }`);
    resultHtml = resultHtml.replace('{blog-menu}', `${ mobileBlogMenu }`);
    resultHtml = resultHtml.replace('{base}', `${ BASE }`);
    resultHtml = resultHtml.replaceAll('{versions-menu}', versionsMenu);
    resultHtml = resultHtml.replaceAll('{current-version}', currentVersion);

    if (isDocs || isBlog || isChangelog) {
      // eslint-disable-next-line redos/no-vulnerable -- is necessary here
      resultHtml = resultHtml.replaceAll(/<h\d id="(?<id>[^"]+)">(?<text>.*?)<\/h\d>/g, (res, id, text) => {
        return res.replace(text, `<a class="anchor" href="${
          htmlFileName.replace('.html', '') }#${ id }"></a>${ text }`);
      });
    }

    resultHtml = resultHtml.replaceAll('{docs-version}', currentVersion);

    await fs.mkdir(path.dirname(htmlFilePath), { recursive: true });

    await fs.writeFile(htmlFilePath, resultHtml, 'utf8');
    echo(chalk.green(`File created: ${ htmlFilePath }`));
  }

  await processPlaygroundFile(template);
  await createDocsIndexes(uniqueVersions);
}

await build().catch(console.error);
