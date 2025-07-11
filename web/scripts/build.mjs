import { Marked } from 'marked';
import { gfmHeadingId, getHeadingList } from "marked-gfm-heading-id";
import { promisify } from 'node:util';
import child_process from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const exec = promisify(child_process.exec);

const docsDir = 'docs/web/';
const blogDir = 'docs/web/blog/';
const resultDir = 'web/dist/';
const templatesDir = 'web/templates/';
const templatePath = `${templatesDir}index.html`;
// const docsMenuPath = 'web/src/docs-menu.html';
const defaultBranch = 'web';
const defaultVersion = 'web';

const args = process.argv;
const lastArg = args[args.length - 1];
const branch = lastArg.startsWith('branch=') ? lastArg.slice('branch='.length) : undefined;

async function getAllMdFiles(dir) {
  let entries = await fs.readdir(dir, { withFileTypes: true });
  let files = [];
  for (let entry of entries) {
    let fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      let subFiles = await getAllMdFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function buildDocsMenu(item) {
  if (item.hasOwnProperty('children')) {
    let result = `<li class="collapsible"><a href="#">${item.title}</a><ul>`;
    for (const child of item.children) {
      result += await buildDocsMenu(child);
    }
    result += '</ul></li>';
    return result;
  }

  return `<li><a href="${item.url}">${item.title}</a></li>`;
}

let docsMenus = [];
async function buildMenuForVersion(version) {
  if (docsMenus[version]) return docsMenus[version];

  echo(chalk.green(`Building docs menu for version: ${version}`));
  const jsonPath = branch ? `${docsDir}docs/menu.json` : `${docsDir}${version}/docs/menu.json`;
  try {
    await fs.access(jsonPath)
  } catch (err) {
    echo(chalk.yellow(`Menu JSON file not found: ${jsonPath}`));
    return '';
  }
  const docsMenuJson = await fs.readFile(jsonPath, 'utf-8');
  try {
    const docsMenu = JSON.parse(docsMenuJson.toString());
    let menu = '<ul><li>{versions-menu}</li>';
    for (const item of docsMenu) {
      menu += await buildDocsMenu(item);
    }
    menu += '</ul>';
    docsMenus[version] = menu;
    return menu;
  } catch (err) {
    return '';
  }
}

async function buildVersionsMenuList(versions, currentVersion) {
  let versionsMenuHtml = '';

  versionsMenuHtml += '<div class="dropdown-block">';
  for (const v of versions) {
    if (v === currentVersion) {
      versionsMenuHtml += `<a href="/${v}/docs/" class="active">${v}</a>`;
    } else {
      versionsMenuHtml += `<a href="/${v}/docs/">${v}</a>`;
    }
  }
  versionsMenuHtml += '</div>';

  return versionsMenuHtml;
}

async function buildVersionMenu(versions, currentVersion) {
  const innerMenu = await buildVersionsMenuList(versions, currentVersion);

  return `<div class="dropdown versions-menu"><div class="dropdown-wrapper"><a href="#" class="current">${currentVersion}</a>${innerMenu}</div><div class="backdrop"></div></div>`;
}

const marked = new Marked();
const markedInline = new Marked();
const customRenderer = {
  link({ href, text }) {
    const htmlContent = markedInline.parseInline(text);
    const isExternal = /^https?:\/\//.test(href);
    const isAnchor = href.startsWith('#');
    if (isAnchor) href = htmlFileName.replace('.html', '') + href.replace('#', '#block-');
    let html = `<a href="${href}"`;
    if (isExternal) html += ' target="_blank"';
    html += `>${htmlContent}</a>`;
    return html;
  }
};
marked.use({ renderer: customRenderer });

let blogMenu = '';
async function buildBlogMenu() {
  if (blogMenu !== '') return blogMenu;

  let mdFiles = await getAllMdFiles(blogDir);
  mdFiles.reverse();
  let menu = '<ul>';
  for (const mdPath of mdFiles) {
    if (mdPath.endsWith('index.md')) continue;
    const mdContent = await fs.readFile(mdPath, 'utf-8');
    const content = mdContent.toString();
    const tokens = marked.lexer(content);
    const firstH1 = tokens.find(token => token.type === 'heading' && token.depth === 1);

    if (!firstH1) {
      echo(chalk.yellow(`H1 not found in ${mdPath}`));
      continue;
    }

    const match = mdPath.match(/(\d{4}-\d{2}-\d{2})-/);
    const date = match ? match[1] : null;
    const htmlFileName = mdPath.replace(blogDir, '').replace(/\.md$/i, '');
    menu += `<li><a href="./blog/${htmlFileName}">${date}: ${firstH1.text}</a></li>`
  }
  menu += '</ul>';
  blogMenu = menu;

  return menu;
}

async function getVersionTags() {
  const tagsString = await exec('git tag | grep -E "^v[4-9]\\.[0-9]+\\.[0-9]+$" | sort -V');
  return tagsString['stdout'].split('\n');
}
// console.log(await getVersionTags());

let htmlFileName = '';
async function build() {
  const template = await fs.readFile(templatePath, 'utf-8');
  let docsMenu = '';
  let isBlog = false;
  let isDocs = false;
  let isChangelog = false;
  let playground = await fs.readFile(`${templatesDir}playground.html`, 'utf-8');

  const markedWithContents = new Marked();
  markedWithContents.use({ renderer: customRenderer });
  markedWithContents.use(gfmHeadingId({ prefix: 'block-' }), {
    hooks: {
      postprocess(html) {
        const headings = getHeadingList().filter(({ level }) => level > 1);
        let result = '<div class="wrapper">';
        if (isBlog) {
          result += `<div class="docs-menu sticky">${blogMenu}</div>`;
        } else if (isDocs) {
          result += `<div class="docs-menu sticky">${docsMenu}</div>`;
        }
        result += `<div class="content">${html}</div>
          <div class="table-of-contents sticky">
              ${headings.map(({ id, raw, level }) => `<div class="toc-link"><a href="${htmlFileName.replace('.html', '')}#${id}" class="h${level}">${raw}</a></div>`).join('\n')}
          </div>`;
        return result;
      }
    }
  });

  const mdFiles = await getAllMdFiles(docsDir);
  const base = branch ? `/branches/${branch}/` : '/';
  // const base = '/core-js-v4/web/dist/';
  const versions = [];
  for (const mdPath of mdFiles) {
    const match = mdPath.match(/\/web\/(?<version>[^\/]+)\/docs\//);
    if (match && match.groups && match.groups.version) {
      versions.push(match.groups.version);
    } else {
      versions.push(defaultBranch);
    }
  }
  const uniqueVersions = [...new Set(versions)];

  const blogMenu = await buildBlogMenu();

  let prevVersion = null;
  let version = '';
  let versionsMenu = '';
  for (const i in mdFiles) {
    const mdPath = mdFiles[i];
    const mdContent = await fs.readFile(mdPath, 'utf-8');
    const content = mdContent.toString();
    isDocs = mdPath.indexOf('/docs') !== -1;
    isChangelog = mdPath.indexOf('/changelog') !== -1;
    isBlog = mdPath.indexOf('/blog') !== -1;

    let mobileDocsMenu = '';
    let mobileBlogMenu = '';

    if (version !== versions[i]) {
      prevVersion = version;
      version = versions[i];
      docsMenu = await buildMenuForVersion(version);
      versionsMenu = await buildVersionMenu(uniqueVersions, version);
    }
    if (isDocs) {
      mobileDocsMenu = docsMenu;
    }
    if (isBlog) {
      mobileBlogMenu = blogMenu;
    }
    htmlFileName = mdPath.replace(docsDir, '').replace(/\.md$/i, '.html');
    const htmlFilePath = path.join(resultDir, htmlFileName);
    const htmlContent = isDocs || isBlog || isChangelog ? markedWithContents.parse(content) : marked.parse(content);

    let resultHtml = template.replace('{content}', `${htmlContent}`);
    resultHtml = resultHtml.replace('{docs-menu}', `${mobileDocsMenu}`);
    resultHtml = resultHtml.replace('{blog-menu}', `${mobileBlogMenu}`);
    resultHtml = resultHtml.replace('{base}', `${base}`);
    resultHtml = resultHtml.replaceAll('{versions-menu}', versionsMenu);
    resultHtml = resultHtml.replaceAll('{current-version}', version);

    if (branch) {
      resultHtml = resultHtml.replaceAll('{default-version}', '.');
      resultHtml = resultHtml.replaceAll('{docs-version}', '.');
    } else {
      resultHtml = resultHtml.replaceAll('{default-version}', defaultVersion);
      resultHtml = resultHtml.replaceAll('{docs-version}', version);
    }

    await fs.mkdir(path.dirname(htmlFilePath), { recursive: true });

    await fs.writeFile(htmlFilePath, resultHtml, 'utf-8');
    echo(chalk.green(`File created: ${htmlFilePath}`));
  }

  versionsMenu = await buildVersionMenu(uniqueVersions, defaultVersion);
  playground = playground.replace('{base}', `${base}`);
  playground = playground.replaceAll('{docs-version}', '');
  playground = playground.replace('{versions-menu}', `${versionsMenu}`);
  playground = playground.replaceAll('{current-version}', version);
  if (branch) {
    playground = playground.replaceAll('{default-version}', '.');
  } else {
    playground = playground.replaceAll('{default-version}', defaultVersion);
  }
  const playgroundFilePath = path.join(resultDir, 'playground.html');
  await fs.mkdir(path.dirname(playgroundFilePath), { recursive: true });
  await fs.writeFile(playgroundFilePath, playground, 'utf-8');
  echo(chalk.green(`File created: ${playgroundFilePath}`));
}

await build().catch(console.error);
