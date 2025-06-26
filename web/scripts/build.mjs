import { Marked } from 'marked';
import { gfmHeadingId, getHeadingList } from "marked-gfm-heading-id";
import { promisify } from 'node:util';
import child_process from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const exec = promisify(child_process.exec);

const docsDir = 'docs/web/';
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

async function buildMenuForVersion(version) {
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
    let menu = '<ul>';
    for (const item of docsMenu) {
      menu += await buildDocsMenu(item);
    }
    menu += '</ul>';
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

  return `<div class="dropdown versions-menu"><a href="#" class="current">${currentVersion}</a>${innerMenu}</div>`;
}

async function build() {
  const template = await fs.readFile(templatePath, 'utf-8');
  let docsMenu = '';
  let sandbox = await fs.readFile(`${templatesDir}sandbox.html`, 'utf-8');
  let htmlFileName = '';

  const marked = new Marked();
  const markedWithContents = new Marked();
  markedWithContents.use(gfmHeadingId({ prefix: 'block-' }), {
    hooks: {
      postprocess(html) {
        const headings = getHeadingList().filter(({ level }) => level > 1);
        return `
<div class="wrapper">
    <div class="docs-menu">
        ${docsMenu}
    </div>
    <div class="content">
        ${html}
    </div>
    <div class="table-of-contents">
        ${headings.map(({ id, raw, level }) => `<div class="toc-link"><a href="${htmlFileName}#${id}" class="h${level}">${raw}</a></div>`).join('\n')}
    </div>
</div>`;
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

  let prevVersion = null;
  let version = '';
  let versionsMenu = '';
  for (const i in mdFiles) {
    const mdPath = mdFiles[i];
    const mdContent = await fs.readFile(mdPath, 'utf-8');
    const content = mdContent.toString();
    const isDocs = mdPath.indexOf('/docs') !== -1;
    let mobileDocsMenu = '';

    if (version !== versions[i]) {
      prevVersion = version;
      version = versions[i];
      docsMenu = await buildMenuForVersion(version);
      versionsMenu = await buildVersionMenu(uniqueVersions, version);
    }
    if (isDocs) {
      mobileDocsMenu = docsMenu;
    }
    htmlFileName = mdPath.replace(docsDir, '').replace(/\.md$/i, '.html');
    const htmlFilePath = path.join(resultDir, htmlFileName);
    const htmlContent = isDocs ? markedWithContents.parse(content) : marked.parse(content);

    let resultHtml = template.replace('{content}', `${htmlContent}`);
    resultHtml = resultHtml.replace('{docs-menu}', `${mobileDocsMenu}`);
    resultHtml = resultHtml.replace('{base}', `${base}`);
    resultHtml = resultHtml.replace('{versions-menu}', `${versionsMenu}`);
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
  sandbox = sandbox.replace('{base}', `${base}`);
  sandbox = sandbox.replaceAll('{docs-version}', '');
  sandbox = sandbox.replace('{versions-menu}', `${versionsMenu}`);
  sandbox = sandbox.replaceAll('{current-version}', version);
  if (branch) {
    sandbox = sandbox.replaceAll('{default-version}', '.');
  } else {
    sandbox = sandbox.replaceAll('{default-version}', defaultVersion);
  }
  const sandboxFilePath = path.join(resultDir, 'sandbox.html');
  await fs.mkdir(path.dirname(sandboxFilePath), { recursive: true });
  await fs.writeFile(sandboxFilePath, sandbox, 'utf-8');
  echo(chalk.green(`File created: ${sandboxFilePath}`));
}

async function getVersionTags() {
  const tagsString = await exec('git tag | grep -E "^v[4-9]\\.[0-9]+\\.[0-9]+$" | sort -V');
  return tagsString['stdout'].split('\n');
}
// console.log(await getVersionTags());

await build().catch(console.error);
