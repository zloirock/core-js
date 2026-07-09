import { expandVersionsConfig, getBranchPreviewName, getDefaultVersion } from './scripts/helpers.mjs';
import fm from 'front-matter';
import { Marked } from 'marked';
import { gfmHeadingId, getHeadingList } from 'marked-gfm-heading-id';
import markedAlert from 'marked-alert';
import config from './config/config.mjs';
import { argv, fs } from 'zx';

const { copy, mkdir, readFile, readJson, readdir, writeFile } = fs;

const branchArg = argv._.find(item => item.startsWith('branch='));
const BRANCH = branchArg ? branchArg.slice('branch='.length) : undefined;
const LOCAL = argv._.includes('local');
// a local build is served from the parent directory of the checkout
const BASE = LOCAL && BRANCH ? `/${ encodePath(path.basename(process.cwd())) }/website/dist/`
  : BRANCH ? `/branches/${ encodePath(getBranchPreviewName(BRANCH)) }/` : '/';
const DEFAULT_VERSION = await getDefaultVersion(config.versionsFile, BRANCH);
// the client strips this version from `.with-docs-version` links on the unversioned `docs/` pages; the links of a branch
// build have no version to strip
const LINKS_DEFAULT_VERSION = BRANCH ? '' : DEFAULT_VERSION;
const HEADING_ID_PREFIX = 'h-';

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

  return `<li><a href="${ item.url }" class="with-docs-version" data-default-version="${ LINKS_DEFAULT_VERSION }">${ item.title }</a></li>`;
}

const docsMenus = [];
const docsMenuItems = [];

async function getDocsMenuItems(version) {
  if (docsMenuItems[version]) return docsMenuItems[version];

  echo(chalk.green(`Getting menu items from file for version: ${ version }`));
  const jsonPath = BRANCH ? `${ config.docsDir }docs/menu.json` : `${ config.docsDir }${ version }/docs/menu.json`;
  try {
    docsMenuItems[version] = await readJson(jsonPath);
    return docsMenuItems[version];
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    echo(chalk.yellow(`Menu JSON file not found: ${ jsonPath }`));
    return [];
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

// a branch, a tag or a directory name as a URL path: each segment percent-encoded, `/` kept - the server decodes it back
function encodePath(name) {
  return name.split('/').map(encodeURIComponent).join('/');
}

// a version label - the branch name in a branch build - as HTML text; `$` too, since the menu goes to pages by `replace`
function escapeLabel(label) {
  return label.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('$', '&#36;');
}

function getBundlesPath(version) {
  return path.join(config.bundlesPath, encodePath(version.branch ?? version.tag));
}

async function buildVersionsMenuList(versions, currentPath, section) {
  let versionsMenuHtml = '<div class="dropdown-block">';
  for (const v of versions) {
    const activityClass = v.path === currentPath && !v.default ? ' class="active"' : '';
    const defaultBadge = v.default ? ' (default)' : '';
    const versionPath = v.default ? '' : `${ v.path }/`;
    versionsMenuHtml += `<a href="./${ versionPath }${ section }"${ activityClass }>${ escapeLabel(v.label) }${ defaultBadge }</a>`;
  }
  versionsMenuHtml += '</div>';

  return versionsMenuHtml;
}

async function buildVersionsMenu(versions, currentPath, section) {
  const innerMenu = await buildVersionsMenuList(versions, currentPath, section);
  // a page knows its version by the path, the menu shows its label
  const label = versions.find(v => v.path === currentPath)?.label ?? currentPath;

  return `<div class="dropdown versions-menu"><div class="dropdown-wrapper"><a href="#" class="current">${
    escapeLabel(label) }</a>${ innerMenu }</div><div class="backdrop"></div></div>`;
}

let fileMetadata = {};

function metadata(markdown) {
  const { attributes, body } = fm(markdown);
  fileMetadata = { ...attributes };
  return body;
}

const markedInline = new Marked();

function stripTags(html) {
  return html.replaceAll(/<[^<>]*>/g, '');
}

// heading ids get a prefix, so an anchor written as on GitHub has to get it too
function headingId(anchor) {
  const id = anchor.toLowerCase();
  return id.startsWith(HEADING_ID_PREFIX) ? id : HEADING_ID_PREFIX + id;
}

// an in-page anchor points to the current page
function resolveAnchor(href) {
  return `${ htmlFileName.replace('.html', '') }#${ headingId(href.slice(1)) }`;
}

// a link to another page of the site keeps its path, its anchor is a heading id of that page
function resolvePageAnchor(href) {
  const index = href.indexOf('#');
  return index === -1 ? href : `${ href.slice(0, index) }#${ headingId(href.slice(index + 1)) }`;
}

// no scheme, no protocol-relative host, not an anchor, a query or a placeholder
function isRelativePath(href) {
  return !/^(?:[a-z][\d+\-.a-z]*:|\/\/|[#?{])/i.test(href);
}

// a copy of a repository file (see `copyCommonFiles`) links other repository files by paths relative to its place there
function resolveRepositoryPath(href) {
  const { posix } = path;
  const [link, hash] = href.split('#');
  const target = link.startsWith('/') ? posix.normalize(link.slice(1)) : posix.join(posix.dirname(fileMetadata.repoPath), link);
  // GitHub redirects between `tree` and `blob` anyway, the extension only saves the redirect
  const kind = posix.extname(target) ? 'blob' : 'tree';
  return `${ config.repositoryURL }/${ kind }/${ encodePath(fileMetadata.repoBranch) }/${ target }${ hash === undefined ? '' : `#${ hash }` }`;
}

const linkRenderer = {
  link({ href, tokens }) {
    // the lexed content, not its text parsed again: an autolink's text would turn into a link nested in the link
    const htmlContent = this.parser.parseInline(tokens);
    const inPage = href.startsWith('#');
    if (inPage) href = resolveAnchor(href);
    else if (href.startsWith('{docs-version}')) href = resolvePageAnchor(href);
    else if (fileMetadata.repoPath && isRelativePath(href)) href = resolveRepositoryPath(href);
    const isExternal = /^https?:\/\//.test(href);
    let html = `<a href="${ href }"`;
    // like the TOC, an in-page anchor has the versioned path of its page, which the client strips on the `docs/` alias
    if (inPage) html += ` class="with-docs-version" data-default-version="${ LINKS_DEFAULT_VERSION }"`;
    if (isExternal) html += ' target="_blank"';
    html += `>${ htmlContent }</a>`;
    return html;
  },
};

const marked = new Marked();
marked.use(markedAlert(), gfmHeadingId({ prefix: HEADING_ID_PREFIX }));
marked.use({ hooks: { preprocess: metadata } });
marked.use({ renderer: linkRenderer });

const markedWithContents = new Marked();
markedWithContents.use(markedAlert(), gfmHeadingId({ prefix: HEADING_ID_PREFIX }));
markedWithContents.use({
  hooks: {
    preprocess: metadata,
    postprocess: buildMenus,
  },
  renderer: linkRenderer,
});

// the toggle of a menu folded into a strip on narrow screens, a button for the keyboard; main.js keeps `aria-expanded`
function menuTrigger(controls, label) {
  return `<button type="button" class="mobile-trigger" aria-controls="${ controls }" aria-expanded="false" aria-label="${ label }"></button>`;
}

const ANCHOR_ICON = '<svg viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"></path></svg>';

// a heading with the link to itself; like the TOC, the anchor has the versioned path of its page, which the client
// strips on the `docs/` alias. Only the headings marked renders get it: a heading typed as raw HTML in the markdown and
// the headings of the blog previews, which come to the blog index already rendered, stay without an anchor
function headingWithAnchor({ id, level, text }) {
  return `<h${ level } id="${ id }" class="with-anchor">${ text }<a class="anchor with-docs-version" data-default-version="${
    LINKS_DEFAULT_VERSION }" href="${ htmlFileName.replace('.html', '') }#${ id }">${ ANCHOR_ICON }</a></h${ level }>`;
}

function buildMenus(html) {
  const headings = getHeadingList().filter(({ level }) => level > 1);
  for (const heading of headings) {
    const { id, level, text } = heading;
    // found by the markup `marked-gfm-heading-id` renders, a function replacement keeps `$` patterns of the text as is
    html = html.replace(`<h${ level } id="${ id }">${ text }</h${ level }>`, () => headingWithAnchor(heading));
  }
  let result = '<div class="wrapper">';
  if (isBlog || isDocs) {
    result += `<div class="docs-menu sticky"><div class="container"><div class="docs-links" id="docs-links">${
      isBlog ? blogMenuCache : docsMenu }</div>${ menuTrigger('docs-links', 'Menu') }</div></div>`;
  }
  result += `<div class="content">${ html }</div>`;
  if (headings.length && !Object.hasOwn(fileMetadata, 'disableContentMenu')) {
    result += `<div class="table-of-contents sticky"><div class="container">${
      menuTrigger('toc-links', 'Table of contents') }<div class="toc-links" id="toc-links">
          ${ headings.map(({ id, text, level }) => `<div class="toc-link"><a href="${
            htmlFileName.replace('.html', '') }#${ id }" class="h${
            level } with-docs-version scroll-to" data-hash="#${ id }" data-default-version="${ LINKS_DEFAULT_VERSION }">${
            // the rendered heading without its tags: `raw` is the source of the slug, without entities
            stripTags(text) }</a></div>`).join('\n') }
        </div></div></div>`;
  }
  return result;
}

// the previews of the blog index are HTML already: its markdown holds placeholders, since rendered again, a blank line
// in a preview (a code block) would end the HTML block
const blogPreviews = [];

function insertBlogPreviews(html) {
  return html.replaceAll(/<!-- blog-preview-(?<index>\d+) -->/g, (_, index) => blogPreviews[index]);
}

let blogMenuCache = '';

async function buildBlogMenu() {
  if (blogMenuCache !== '') return blogMenuCache;

  const mdFiles = await getAllMdFiles(config.blogDir);
  mdFiles.reverse();
  let index = '---\ndisableContentMenu: true\n---\n# Blog\n\n';
  let menu = '<ul>';
  for (const mdPath of mdFiles) {
    if (mdPath.endsWith('index.md')) continue;
    const content = await readFile(mdPath, 'utf8');
    const tokens = marked.lexer(content);
    const firstH1 = tokens.find(token => token.type === 'heading' && token.depth === 1);

    if (!firstH1) {
      echo(chalk.yellow(`H1 not found in ${ mdPath }`));
      continue;
    }
    // the preview goes to the blog index, its in-page anchors have to point to the post page
    htmlFileName = mdPath.replace(config.docsDir, '').replace(/\.md$/i, '.html');
    let htmlContent = await marked.parse(content);
    // eslint-disable-next-line redos/no-vulnerable -- safe
    htmlContent = htmlContent.replace(/<h1[^>]*>.*?<\/h1>/i, '');
    const hrIndex = htmlContent.search(/<hr>/i);
    const preview = hrIndex !== -1 ? htmlContent.slice(0, hrIndex) : htmlContent;

    const match = mdPath.match(/(?<date>\d{4}-\d{2}-\d{2})-/);
    const date = match?.groups?.date ?? '';
    const fileName = mdPath.replace(config.blogDir, '').replace(/\.md$/i, '');
    // the H1 is inline markdown, its own links can't stay inside the link of the menu
    menu += `<li><a href="./blog/${ fileName }">${ date }: ${
      markedInline.parseInline(firstH1.text).replaceAll(/<\/?a\b[^<>]*>/g, '') }</a></li>`;
    index += `## [${ firstH1.text }](./blog/${ fileName })\n\n`;
    if (date) index += `*${ date }*\n\n`;
    index += `<!-- blog-preview-${ blogPreviews.push(preview) - 1 } -->\n\n`;
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

// what `{docs-version}/` of docs paths becomes: a branch build has one version and writes its pages without its directory
function docsVersionPath(version) {
  return BRANCH ? '' : `${ version }/`;
}

async function buildPlaygrounds(template, versions) {
  for (const version of versions) {
    await buildPlayground(template, version, versions);
  }
}

async function buildPlayground(template, version, versions) {
  const bundlesPath = getBundlesPath(version);
  const bundleScript = `<script nomodule src="${ bundlesPath }/${ config.bundleName }"></script>`;
  const bundleESModulesScript = `<script type="module" src="${ bundlesPath }/${ config.bundleNameESModules }"></script>`;
  // Babel standalone needs the polyfills of the bundle when it loads, so each copy follows its bundle: with modules,
  // the bundle is a deferred module and Babel the module right after it, ahead of the site scripts in document order
  const babelESModulesScript = '<script type="module" src="./babel.min.js"></script>';
  const babelScript = '<script nomodule src="./babel.min.js"></script>';
  const playgroundContent = await readFile(`${ config.srcDir }playground.html`, 'utf8');
  const versionsMenu = await buildVersionsMenu(versions, version.path, 'playground');
  let playground = template.replace('{content}', playgroundContent);
  playground = playground.replace('{base}', BASE);
  playground = playground.replace('{title}', 'Playground - ');
  playground = playground.replace('{core-js-bundle}', bundleScript);
  playground = playground.replace('{core-js-bundle-esmodules}', bundleESModulesScript + babelESModulesScript);
  playground = playground.replace('{babel-script}', babelScript);
  const playgroundWithVersion = playground.replace('{versions-menu}', versionsMenu);
  const playgroundFilePath = path.join(config.resultDir, version.path, 'playground.html');

  if (version.default) {
    const defaultPlaygroundPath = path.join(config.resultDir, 'playground.html');
    await writeFile(defaultPlaygroundPath, playgroundWithVersion, 'utf8');
    echo(chalk.green(`File created: ${ defaultPlaygroundPath }`));
  } else {
    await mkdir(path.dirname(playgroundFilePath), { recursive: true });
    await writeFile(playgroundFilePath, playgroundWithVersion, 'utf8');
    echo(chalk.green(`File created: ${ playgroundFilePath }`));
  }
}

async function createDocsIndexes(versions) {
  if (BRANCH) versions = [{ path: '' }];

  for (const version of versions) {
    if (version.default && versions.length > 1) continue;
    const versionPath = version.path;
    const menuItems = await getDocsMenuItems(versionPath);
    if (!menuItems.length) continue;
    const firstDocPath = path.join(config.resultDir,
      `${ menuItems[0].url }.html`.replace('{docs-version}/', docsVersionPath(versionPath)));
    const indexFilePath = path.join(config.resultDir, `${ versionPath }/docs/`, 'index.html');
    await copy(firstDocPath, indexFilePath);
    echo(chalk.green(`File created: ${ indexFilePath }`));
  }
}

async function getVersions() {
  if (BRANCH) {
    return [{
      branch: BRANCH,
      default: true,
      label: BRANCH,
      path: BRANCH,
    }];
  }

  const versions = await readJson(config.versionsFile);
  echo(chalk.green('Got versions from file'));

  return expandVersionsConfig(versions);
}

function getTitle(content) {
  const match = /^# (?<title>.+)$/m.exec(content);
  // `<title>` is plain text, so the inline markdown of the heading is rendered and its tags are dropped
  return match?.groups?.title ? `${ stripTags(markedInline.parseInline(match.groups.title)) } - ` : '';
}

async function build() {
  const template = await readFile(config.templatePath, 'utf8');
  await buildBlogMenu();
  const mdFiles = await getAllMdFiles(config.docsDir);
  const versions = await getVersions();
  const [defaultVersion] = versions;
  const bundlesPath = getBundlesPath(defaultVersion);
  const bundleScript = `<script nomodule src="${ bundlesPath }/${ config.bundleName }"></script>`;
  const bundleESModulesScript = `<script type="module" src="${ bundlesPath }/${ config.bundleNameESModules }"></script>`;

  let currentVersion = '';
  let versionsMenu = '';
  for (const mdPath of mdFiles) {
    const content = await readFile(mdPath, 'utf8');
    const isChangelog = mdPath.includes('/changelog');
    isDocs = mdPath.includes('/docs');
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
    const htmlContent = insertBlogPreviews(isDocs || isBlog || isChangelog ? markedWithContents.parse(content) : marked.parse(content));

    let resultHtml = template.replace('{content}', htmlContent.replaceAll('$', '&#36;'));

    resultHtml = resultHtml.replace('{title}', title.replaceAll('$', '&#36;'));
    resultHtml = resultHtml.replace('{base}', BASE);
    resultHtml = resultHtml.replace('{core-js-bundle}', bundleScript);
    resultHtml = resultHtml.replace('{core-js-bundle-esmodules}', bundleESModulesScript);
    resultHtml = resultHtml.replaceAll('{versions-menu}', versionsMenu);
    resultHtml = resultHtml.replaceAll('{docs-version}/', docsVersionPath(currentVersion));

    await mkdir(path.dirname(htmlFilePath), { recursive: true });

    await writeFile(htmlFilePath, resultHtml, 'utf8');
    echo(chalk.green(`File created: ${ htmlFilePath }`));
  }

  await buildPlaygrounds(template, versions);
  await createDocsIndexes(versions);
}

await build();
