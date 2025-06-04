import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import fs from 'fs/promises';
import hljs from 'highlight.js';
import path from 'path';

const docsDir = './docs/web';
const resultDir = './web/dist';
const templatePath = './web/templates/index.html';

async function build() {
  const template = await fs.readFile(templatePath, 'utf-8');

  const files = await fs.readdir(docsDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  const marked = new Marked(markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  }));

  for (const file of mdFiles) {
    const mdPath = path.join(docsDir, file);
    const mdContent = await fs.readFile(mdPath, 'utf-8');
    const htmlContent = marked.parse(mdContent.toString());

    const resultHtml = template.replace(
      '{content}',
      `${htmlContent}`
    );

    const htmlFileName = file.replace(/\.md$/i, '.html');
    const htmlFilePath = path.join(resultDir, htmlFileName);

    await fs.writeFile(htmlFilePath, resultHtml, 'utf-8');
    echo(chalk.green(`File created: ${htmlFilePath}`));
  }
}

build().catch(console.error);
