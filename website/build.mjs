import { expandVersionsConfig, getBranchPreviewName, getDefaultVersion } from './scripts/helpers.mjs';
import fm from 'front-matter';
import { Marked } from 'marked';
import { gfmHeadingId, getHeadingList } from 'marked-gfm-heading-id';
import markedAlert from 'marked-alert';
import config from './config/config.mjs';
import { argv, fs } from 'zx';

const { mkdir, readFile, readJson, readdir, writeFile } = fs;

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

let pagePath = '';
let pageMenu;

// These paths also form site URLs, including on Windows.
async function getAllMdFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getAllMdFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

const docsMenus = new Map();

async function getDocsMenu(version) {
  if (docsMenus.has(version)) return docsMenus.get(version);

  const jsonPath = BRANCH ? `${ config.docsDir }docs/menu.json` : `${ config.docsDir }${ version }/docs/menu.json`;
  let items = [];
  try {
    items = await readJson(jsonPath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    echo(chalk.yellow(`Menu JSON file not found: ${ jsonPath }`));
  }

  let firstUrl;
  function render(item) {
    if (Object.hasOwn(item, 'children')) {
      return `<li class="collapsible"><a href="#">${ item.title }</a><ul>${ item.children.map(render).join('') }</ul></li>`;
    }
    firstUrl ||= item.url;
    return `<li><a href="${ item.url }" class="with-docs-version" data-default-version="${ LINKS_DEFAULT_VERSION }">${ item.title }</a></li>`;
  }

  const html = items.length ? `<ul><li>{versions-menu}</li>${ items.map(render).join('') }</ul>` : '';
  const menu = { html, firstUrl };
  docsMenus.set(version, menu);
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

function decodeUrlPart(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getPage(pages, url) {
  const pathname = path.posix.normalize(decodeUrlPart(url.split(/[#?]/, 1)[0]));
  return pages.get(pathname.replace(/\.html$/, '')) ?? pages.get(path.posix.join(pathname, 'index'));
}

// Only Markdown heading links carry the marker. Resolve them against the destination page, including its index alias.
function resolveHeadingLinks(html, pages) {
  return html.replaceAll(/href="(?<page>[^"#]*)#\0(?<slug>[^"]*)"/g, (_, page, slug) => {
    const decoded = decodeUrlPart(slug);
    const id = decoded.toLowerCase();
    let prefix = HEADING_ID_PREFIX;
    if (id.startsWith(prefix)) {
      const headings = getPage(pages, page)?.headings;
      if (!headings?.has(prefix + id)) prefix = '';
    }
    const hash = decoded === slug || decoded === id ? slug.toLowerCase() : encodeURIComponent(id);
    return `href="${ page }#${ prefix }${ hash }"`;
  });
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
    const withDocsVersion = inPage || href.startsWith('{docs-version}/');
    if (inPage) href = pagePath + href;
    if (withDocsVersion) href = href.replace('#', '#\0');
    else if (fileMetadata.repoPath && isRelativePath(href)) href = resolveRepositoryPath(href);
    const isExternal = /^https?:\/\//.test(href);
    let html = `<a href="${ href }"`;
    if (withDocsVersion) html += ` class="with-docs-version" data-default-version="${ LINKS_DEFAULT_VERSION }"`;
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

const ANCHOR_ICON = '<svg viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" focusable="false"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"></path></svg>';

// a heading with the link to itself; like the TOC, the anchor has the versioned path of its page, which the client
// strips on the `docs/` alias. Only the headings marked renders get it: a heading typed as raw HTML in the markdown and
// the headings of the blog previews, which come to the blog index already rendered, stay without an anchor
function headingWithAnchor({ id, level, text }) {
  return `<h${ level } id="${ id }" class="with-anchor">${ text }<a class="anchor with-docs-version" aria-labelledby="${ id }" data-default-version="${
    LINKS_DEFAULT_VERSION }" href="${ pagePath }#${ id }">${ ANCHOR_ICON }</a></h${ level }>`;
}

function buildMenus(html) {
  const headings = getHeadingList().filter(({ level }) => level > 1);
  for (const heading of headings) {
    const { id, level, text } = heading;
    // found by the markup `marked-gfm-heading-id` renders, a function replacement keeps `$` patterns of the text as is
    html = html.replace(`<h${ level } id="${ id }">${ text }</h${ level }>`, () => headingWithAnchor(heading));
  }
  let result = '<div class="wrapper">';
  if (pageMenu !== undefined) {
    result += `<div class="docs-menu sticky"><div class="container"><div class="docs-links" id="docs-links">${
      pageMenu }</div>${ menuTrigger('docs-links', 'Menu') }</div></div>`;
  }
  result += `<div class="content">${ html }</div>`;
  if (headings.length && !Object.hasOwn(fileMetadata, 'disableContentMenu')) {
    result += `<div class="table-of-contents sticky"><div class="container">${
      menuTrigger('toc-links', 'Table of contents') }<div class="toc-links" id="toc-links">
          ${ headings.map(({ id, text, level }) => `<div class="toc-link"><a href="${
            pagePath }#${ id }" class="h${
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
    if (mdPath.endsWith('/index.md')) continue;
    const content = await readFile(mdPath, 'utf8');
    const tokens = marked.lexer(content);
    const firstH1 = tokens.find(token => token.type === 'heading' && token.depth === 1);

    if (!firstH1) {
      echo(chalk.yellow(`H1 not found in ${ mdPath }`));
      continue;
    }
    // the preview goes to the blog index, its in-page anchors have to point to the post page
    pagePath = mdPath.slice(config.docsDir.length, -3);
    let htmlContent = await marked.parse(content);
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

async function getPageSources(versions) {
  const sources = new Map();
  for (const mdPath of await getAllMdFiles(config.docsDir)) {
    sources.set(mdPath.slice(config.docsDir.length, -3), mdPath);
  }
  // Render each docs index from its first menu page so its own anchors use the directory URL.
  for (const version of versions) {
    if (version.default && versions.length > 1) continue;
    const prefix = docsVersionPath(version.path);
    const { firstUrl } = await getDocsMenu(version.path);
    if (!firstUrl) continue;
    const url = firstUrl.replace('{docs-version}/', prefix);
    const source = getPage(sources, url);
    if (!source) throw new Error(`Documentation page not found: ${ url }`);
    sources.set(`${ prefix }docs/index`, source);
  }
  return sources;
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
  const versions = await getVersions();
  const [defaultVersion] = versions;
  const bundlesPath = getBundlesPath(defaultVersion);
  const bundleScript = `<script nomodule src="${ bundlesPath }/${ config.bundleName }"></script>`;
  const bundleESModulesScript = `<script type="module" src="${ bundlesPath }/${ config.bundleNameESModules }"></script>`;

  let currentVersion = '';
  let docsMenu = '';
  let versionsMenu = '';
  const pages = new Map();
  for (const [page, mdPath] of await getPageSources(versions)) {
    const content = await readFile(mdPath, 'utf8');
    const title = getTitle(content);
    const docsVersion = versions.find(v => page.startsWith(`${ docsVersionPath(v.path) }docs/`));
    const version = docsVersion?.path ?? DEFAULT_VERSION;
    if (currentVersion !== version) {
      currentVersion = version;
      docsMenu = (await getDocsMenu(currentVersion)).html;
      versionsMenu = await buildVersionsMenu(versions, currentVersion, 'docs/');
    }

    pagePath = page === 'index' ? '' : page.replace(/\/index$/, '/');
    pageMenu = docsVersion || page.startsWith('docs/') ? docsMenu : page.startsWith('blog/') ? blogMenuCache : undefined;
    const parser = pageMenu !== undefined || page === 'changelog' ? markedWithContents : marked;
    const htmlContent = insertBlogPreviews(parser.parse(content));
    const headings = new Set(getHeadingList().map(({ id }) => id));

    let resultHtml = template.replace('{content}', htmlContent.replaceAll('$', '&#36;'));

    resultHtml = resultHtml.replace('{title}', title.replaceAll('$', '&#36;'));
    resultHtml = resultHtml.replace('{base}', BASE);
    resultHtml = resultHtml.replace('{core-js-bundle}', bundleScript);
    resultHtml = resultHtml.replace('{core-js-bundle-esmodules}', bundleESModulesScript);
    resultHtml = resultHtml.replaceAll('{versions-menu}', versionsMenu);
    resultHtml = resultHtml.replaceAll('{docs-version}/', docsVersionPath(currentVersion));
    pages.set(page, { html: resultHtml, headings });
  }

  for (const [page, { html }] of pages) {
    const htmlFilePath = path.join(config.resultDir, `${ page }.html`);
    const resultHtml = resolveHeadingLinks(html, pages);
    await mkdir(path.dirname(htmlFilePath), { recursive: true });
    await writeFile(htmlFilePath, resultHtml, 'utf8');
    echo(chalk.green(`File created: ${ htmlFilePath }`));
  }

  await buildPlaygrounds(template, versions);
}

await build();
