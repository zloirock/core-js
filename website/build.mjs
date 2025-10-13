/* eslint-disable import/no-unresolved -- dependencies are not installed */
import { getDefaultVersion } from './scripts/helpers.mjs';
import fm from 'front-matter';
import { JSDOM } from 'jsdom';
import { Marked } from 'marked';
import { gfmHeadingId, getHeadingList } from 'marked-gfm-heading-id';
import markedAlert from 'marked-alert';
import config from './config/config.mjs';
import { argv, fs } from 'zx';

const { copy, mkdir, readFile, readJson, readdir, writeFile } = fs;

const branchArg = argv._.find(item => item.startsWith('branch='));
const BRANCH = branchArg ? branchArg.slice('branch='.length) : undefined;
const LOCAL = argv._.includes('local');
const BASE = LOCAL && BRANCH ? '/core-js/website/dist/' : BRANCH ? `/branches/${ BRANCH }/` : '/';
const DEFAULT_VERSION = await getDefaultVersion(config.versionsFile, BRANCH);

let htmlFileName = '';
let docsMenu = '';
let isBlog = false;
let isDocs = false;

async function getAllMdFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
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
  const jsonPath = BRANCH ? `${ config.docsDir }docs/menu.json` : `${ config.docsDir }${ version }/docs/menu.json`;
  try {
    const docsMenuJson = await readJson(jsonPath);
    docsMenuItems[version] = docsMenuJson === '' ? [] : docsMenuJson;
    return docsMenuItems[version];
  } catch {
    echo(chalk.yellow(`Menu JSON file not found: ${ jsonPath }`));
    return '';
  }
}

async function buildDocsMenuForVersion(version) {
  if (docsMenus[version]) return docsMenus[version];

  echo(chalk.green(`Building docs menu for version: ${ version }`));
  const menuItems = await getDocsMenuItems(version);
  if (!menuItems.length) return '';
  let menu = '<ul><li>{versions-menu}</li>';
  for (const item of menuItems) {
    menu += await buildDocsMenu(item);
  }
  menu += '</ul>';
  docsMenus[version] = menu;
  return menu;
}

async function buildVersionsMenuList(versions, currentVersion, section) {
  let versionsMenuHtml = '<div class="dropdown-block">';
  for (const v of versions) {
    const activityClass = v.label === currentVersion && !v.default ? ' class="active"' : '';
    const defaultBadge = v.default ? ' (default)' : '';
    const versionPath = v.default ? '' : `${ v.path ?? v.label }/`;
    versionsMenuHtml += `<a href="./${ versionPath }${ section }"${ activityClass }>${ v.label }${ defaultBadge }</a>`;
  }
  versionsMenuHtml += '</div>';

  return versionsMenuHtml;
}

async function buildVersionsMenu(versions, currentVersion, section) {
  const innerMenu = await buildVersionsMenuList(versions, currentVersion, section);

  return `<div class="dropdown versions-menu"><div class="dropdown-wrapper"><a href="#" class="current">${
    currentVersion }</a>${ innerMenu }</div><div class="backdrop"></div></div>`;
}

let fileMetadata = {};

function metadata(markdown) {
  const { attributes, body } = fm(markdown);
  fileMetadata = {};
  for (const prop of Object.keys(attributes)) {
    fileMetadata[prop] = attributes[prop];
  }
  return body;
}

const markedInline = new Marked();

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

const marked = new Marked();
marked.use(markedAlert(), gfmHeadingId({ prefix: 'h-' }));
marked.use({ hooks: { preprocess: metadata } });
marked.use({ renderer: linkRenderer });

const markedWithContents = new Marked();
markedWithContents.use(markedAlert(), gfmHeadingId({ prefix: 'h-' }));
markedWithContents.use({
  hooks: {
    preprocess: metadata,
    postprocess: buildMenus,
  },
  renderer: linkRenderer,
});

function buildMenus(html) {
  const headings = getHeadingList().filter(({ level }) => level > 1);
  let result = '<div class="wrapper">';
  if (isBlog || isDocs) {
    result += `<div class="docs-menu sticky"><div class="container"><div class="docs-links">${
      isBlog ? blogMenuCache : docsMenu }</div><div class="mobile-trigger"></div></div></div>`;
  }
  result += `<div class="content">${ html }</div>`;
  if (headings.length && !Object.hasOwn(fileMetadata, 'disableContentMenu')) {
    result += `<div class="table-of-contents sticky"><div class="container"><div class="mobile-trigger"></div><div class="toc-links">
          ${ headings.map(({ id, raw, level }) => `<div class="toc-link"><a href="${
            htmlFileName.replace('.html', '') }#${ id }" class="h${
            level } with-docs-version scroll-to" data-hash="#${ id }" data-default-version="${ DEFAULT_VERSION }">${
            raw }</a></div>`).join('\n') }
        </div></div></div>`;
  }
  return result;
}

let blogMenuCache = '';

async function buildBlogMenu() {
  if (blogMenuCache !== '') return blogMenuCache;

  const mdFiles = await getAllMdFiles(config.blogDir);
  mdFiles.reverse();
  let index = '---\ndisableContentMenu: true\n---\n';
  let menu = '<ul>';
  for (const mdPath of mdFiles) {
    if (mdPath.endsWith('index.md')) continue;
    const content = await readFileContent(mdPath);
    const tokens = marked.lexer(content);
    const firstH1 = tokens.find(token => token.type === 'heading' && token.depth === 1);

    if (!firstH1) {
      echo(chalk.yellow(`H1 not found in ${ mdPath }`));
      continue;
    }
    let htmlContent = await marked.parse(content);
    htmlContent = htmlContent.replace(/<h1>[^<]*<\/h1>/i, '');
    const hrIndex = htmlContent.search(/<hr>/i);
    const preview = hrIndex !== -1 ? htmlContent.slice(0, hrIndex) : htmlContent;

    const match = mdPath.match(/(?<date>\d{4}-\d{2}-\d{2})-/);
    const date = match?.groups?.date ?? '';
    const fileName = mdPath.replace(config.blogDir, '').replace(/\.md$/i, '');
    menu += `<li><a href="./blog/${ fileName }">${ date }: ${ firstH1.text }</a></li>`;
    index += `## [${ firstH1.text }](./blog/${ fileName })\n\n`;
    if (date) index += `*${ date }*\n\n`;
    index += `${ preview }\n\n`;
  }
  menu += '</ul>';
  blogMenuCache = menu;
  const blogIndexPath = path.join(config.blogDir, 'index.md');
  await writeFile(blogIndexPath, index, 'utf8');
  echo(chalk.green(`File created: ${ blogIndexPath }`));

  return menu;
}

async function getVersionFromMdFile(mdPath) {
  const match = mdPath.match(/\/web\/(?<version>[^/]+)\/docs\//);
  return match?.groups?.version ?? DEFAULT_VERSION;
}

async function readFileContent(filePath) {
  const content = await readFile(filePath, 'utf8');
  return content.toString();
}

async function buildPlaygrounds(template, versions) {
  for (const version of versions) {
    await buildPlayground(template, version, versions);
  }
}

async function buildPlayground(template, version, versions) {
  const versionPath = version.path ?? version.label;
  const bundleScript = `<script nomodule src="${ config.bundlesPath }/${ versionPath }/${ config.bundleName }"></script>`;
  const bundleESModulesScript = `<script type="module" src="${ config.bundlesPath }/${ versionPath }/${ config.bundleNameESModules }"></script>`;
  const babelScript = '<script src="./babel.min.js"></script>';
  const playgroundContent = await readFileContent(`${ config.srcDir }playground.html`);
  const versionsMenu = await buildVersionsMenu(versions, version.label, 'playground');
  let playground = template.replace('{content}', playgroundContent);
  playground = playground.replace('{base}', BASE);
  playground = playground.replace('{title}', 'Playground - ');
  playground = playground.replace('{core-js-bundle}', bundleScript);
  playground = playground.replace('{core-js-bundle-esmodules}', bundleESModulesScript);
  playground = playground.replace('{babel-script}', babelScript);
  const playgroundWithVersion = playground.replace('{versions-menu}', versionsMenu);
  const playgroundFilePath = path.join(config.resultDir, versionPath, 'playground.html');

  if (version.default) {
    const defaultVersionsMenu = await buildVersionsMenu(versions, version.label, 'playground');
    const defaultVersionPlayground = playground.replace('{versions-menu}', defaultVersionsMenu);
    const defaultPlaygroundPath = path.join(config.resultDir, 'playground.html');
    await writeFile(defaultPlaygroundPath, defaultVersionPlayground, 'utf8');
    echo(chalk.green(`File created: ${ defaultPlaygroundPath }`));
  } else {
    await mkdir(path.dirname(playgroundFilePath), { recursive: true });
    await writeFile(playgroundFilePath, playgroundWithVersion, 'utf8');
    echo(chalk.green(`File created: ${ playgroundFilePath }`));
  }
}

async function createDocsIndexes(versions) {
  if (BRANCH) versions = [{ label: '' }];

  for (const version of versions) {
    if (version.default) continue;
    const versionPath = version.path ?? version.label;
    const menuItems = await getDocsMenuItems(versionPath);
    const firstDocPath = path.join(config.resultDir,
      `${ menuItems[0].url }.html`.replace(`{docs-version}${ BRANCH ? '/' : '' }`, versionPath));
    const indexFilePath = path.join(config.resultDir, `${ versionPath }/docs/`, 'index.html');
    await copy(firstDocPath, indexFilePath);
    echo(chalk.green(`File created: ${ indexFilePath }`));
  }
}

async function getVersions() {
  if (BRANCH) {
    return [{
      label: BRANCH,
      default: true,
    }];
  }
  const versions = await readJson(config.versionsFile);
  echo(chalk.green('Got versions from file'));

  return versions;
}

function getTitle(content) {
  const match = /^# (?<title>.+)$/m.exec(content);
  return match?.groups?.title ? `${ match.groups.title } - ` : '';
}

async function build() {
  const template = await readFileContent(config.templatePath);
  await buildBlogMenu();
  const mdFiles = await getAllMdFiles(config.docsDir);
  const versions = await getVersions();
  const bundleScript = `<script nomodule src="${ config.bundlesPath }/${ DEFAULT_VERSION }/${ config.bundleName }"></script>`;
  const bundleESModulesScript = `<script type="module" src="${ config.bundlesPath }/${ DEFAULT_VERSION }/${ config.bundleNameESModules }"></script>`;

  let currentVersion = '';
  let versionsMenu = '';
  let isChangelog;
  for (let i = 0; i < mdFiles.length; i++) {
    const mdPath = mdFiles[i];
    const content = await readFileContent(mdPath);
    isDocs = mdPath.includes('/docs');
    isChangelog = mdPath.includes('/changelog');
    isBlog = mdPath.includes('/blog');

    const title = getTitle(content);

    const versionFromMdFile = await getVersionFromMdFile(mdPath);
    if (currentVersion !== versionFromMdFile) {
      currentVersion = versionFromMdFile;
      docsMenu = await buildDocsMenuForVersion(currentVersion);
      versionsMenu = await buildVersionsMenu(versions, currentVersion, 'docs/');
    }

    htmlFileName = mdPath.replace(config.docsDir, '').replace(/\.md$/i, '.html');
    const htmlFilePath = path.join(config.resultDir, htmlFileName);
    const htmlContent = isDocs || isBlog || isChangelog ? markedWithContents.parse(content) : marked.parse(content);

    let resultHtml = template.replace('{content}', htmlContent.replaceAll('$', '&#36;'));

    resultHtml = resultHtml.replace('{title}', title);
    resultHtml = resultHtml.replace('{base}', BASE);
    resultHtml = resultHtml.replace('{core-js-bundle}', bundleScript);
    resultHtml = resultHtml.replace('{core-js-bundle-esmodules}', bundleESModulesScript);
    resultHtml = resultHtml.replaceAll('{versions-menu}', versionsMenu);
    resultHtml = resultHtml.replaceAll('{current-version}', currentVersion);

    if (isDocs || isBlog || isChangelog) {
      const resultDOM = new JSDOM(resultHtml);
      const { document } = resultDOM.window;
      document.querySelectorAll('h2[id], h3[id], h4[id], h5[id], h6[id]').forEach(heading => {
        const newHeading = heading.cloneNode(true);
        const anchor = document.createElement('a');
        anchor.className = 'anchor';
        anchor.href = `${ htmlFileName.replace('.html', '') }#${ newHeading.id }`;
        anchor.innerHTML = '<svg viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"></path></svg>';
        newHeading.append(anchor);
        newHeading.classList.add('with-anchor');
        resultHtml = resultHtml.replace(heading.outerHTML, newHeading.outerHTML);
      });
    }

    resultHtml = resultHtml.replaceAll('{docs-version}', currentVersion);

    await mkdir(path.dirname(htmlFilePath), { recursive: true });

    await writeFile(htmlFilePath, resultHtml, 'utf8');
    echo(chalk.green(`File created: ${ htmlFilePath }`));
  }

  await buildPlaygrounds(template, versions);
  await createDocsIndexes(versions);
}

await build().catch(console.error);
