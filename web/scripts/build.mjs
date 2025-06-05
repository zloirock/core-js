import { Marked } from 'marked';
import { gfmHeadingId, getHeadingList } from "marked-gfm-heading-id";
import { markedHighlight } from 'marked-highlight';
import fs from 'fs/promises';
import hljs from 'highlight.js';
import path from 'path';

const docsDir = 'docs/web/';
const resultDir = 'web/dist/';
const templatePath = 'web/templates/index.html';

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

  const highlightExt = markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  });
  const marked = new Marked(highlightExt);
  const markedWithContents = new Marked(highlightExt)
  markedWithContents.use(gfmHeadingId({ prefix: 'block-' }), {
    hooks: {
      postprocess(html) {
        const headings = getHeadingList().filter(({ level }) => level > 1);
        return `
<div class="wrapper">
  <div class="content">
      ${html}
  </div>
  <div class="table-of-contents">
      ${headings.map(({ id, raw, level }) => `<div class="toc-link"><a href="#${id}" class="h${level}">${raw}</a></div>`).join('\n')}
  </div>
</div>`;
      }
    }
  });

  const mdFiles = await getAllMdFiles(docsDir);
  for (const mdPath of mdFiles) {
    const mdContent = await fs.readFile(mdPath, 'utf-8');
    const content = mdContent.toString();
    const htmlContent = mdPath.indexOf('docs') !== -1 ? markedWithContents.parse(content) : marked.parse(content);

    const resultHtml = template.replace('{content}', `${htmlContent}`);

    const htmlFileName = mdPath.replace(docsDir, '').replace(/\.md$/i, '.html');
    const htmlFilePath = path.join(resultDir, htmlFileName);
    await fs.mkdir(path.dirname(htmlFilePath), { recursive: true });

    await fs.writeFile(htmlFilePath, resultHtml, 'utf-8');
    echo(chalk.green(`File created: ${htmlFilePath}`));
  }
}

await build().catch(console.error);
