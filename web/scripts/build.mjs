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
const docsMenuPath = 'web/src/docs-menu.html';
const defaultBranch = 'web';

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

async function build() {
  const template = await fs.readFile(templatePath, 'utf-8');
  const docsMenu = await fs.readFile(docsMenuPath, 'utf-8');
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
  const base = branch && branch !== defaultBranch ? `/branches/${branch}/` : '/';
  // const base = '/core-js-v4/web/dist/';
  for (const mdPath of mdFiles) {
    const mdContent = await fs.readFile(mdPath, 'utf-8');
    const content = mdContent.toString();
    const isDocs = mdPath.indexOf('/docs') !== -1;
    let version = '';
    let mobileDocsMenu = '';
    if (isDocs) {
      const groups = mdPath.match(/(?<version>[^\/]+)\/docs\//);
      if (groups && groups.version) version = groups.version;
      mobileDocsMenu = docsMenu;
    }
    htmlFileName = mdPath.replace(docsDir, '').replace(/\.md$/i, '.html');
    const htmlFilePath = path.join(resultDir, htmlFileName);
    const htmlContent = isDocs ? markedWithContents.parse(content) : marked.parse(content);

    let resultHtml = template.replace('{content}', `${htmlContent}`);
    resultHtml = resultHtml.replace('{docs-menu}', `${mobileDocsMenu}`);
    resultHtml = resultHtml.replace('{base}', `${base}`);
    version = version !== '' ? version + '/' : version;
    resultHtml = resultHtml.replaceAll('{docs-version}/', `${version}`);

    await fs.mkdir(path.dirname(htmlFilePath), { recursive: true });

    await fs.writeFile(htmlFilePath, resultHtml, 'utf-8');
    echo(chalk.green(`File created: ${htmlFilePath}`));
  }

  sandbox = sandbox.replace('{base}', `${base}`);
  sandbox = sandbox.replaceAll('{docs-version}', '');
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
