// markdown-it: CommonMark rendered to HTML, the GFM table extension, the token stream. Every expected
// value is a CommonMark spec example (0.31.2) or the table extension's documented output.
//
// Its reason is the SYNTAX axis: its export is a class wrapped to be callable without `new`, and the
// wrapper reads `new.target` - `Reflect.construct(cls, args, new.target && new.target !== wrapper ?
// new.target : cls)` - a form no other library here spells. Both spellings run below, so V8 coverage
// of a native run counts 2 of its 3 `new.target` reads executed. Beside it, 10 class expressions in
// the module graph the exercise imports.
//
// linkify-it, which markdown-it pulls in, builds its URL and e-mail patterns with the sticky flag at
// run time, which only the global version can answer on IE11; linkify is off by default and stays off.
import markdownit from 'markdown-it';
import { checker } from './checks.mjs';

export function run() {
  const { checks, check } = checker();
  // both spellings on purpose: called without `new`, the wrapper constructs through `Reflect.construct`
  const called = markdownit();
  // eslint-disable-next-line new-cap, sonarjs/inconsistent-function-call -- the export's own name, and see above
  const constructed = new markdownit('commonmark');
  check('callable_and_constructible', [typeof called.render, typeof constructed.render], ['function', 'function']);
  check('atx_heading', called.render('# foo'), '<h1>foo</h1>\n');
  check('emphasis', called.render('*foo* **bar**'), '<p><em>foo</em> <strong>bar</strong></p>\n');
  check('link', called.render('[link](/uri "title")'), '<p><a href="/uri" title="title">link</a></p>\n');
  check('fenced_code', called.render('```js\n<\n```'), '<pre><code class="language-js">&lt;\n</code></pre>\n');
  check('blockquote_list', called.render('> - a\n> - b'), '<blockquote>\n<ul>\n<li>a</li>\n<li>b</li>\n</ul>\n</blockquote>\n');
  check('entity', called.render('&amp; &copy; &#35;'), '<p>&amp; © #</p>\n');
  check('html_off_by_default', called.render('<b>x</b>'), '<p>&lt;b&gt;x&lt;/b&gt;</p>\n');
  check('table', called.render('| a | b |\n| - | :-: |\n| 1 | 2 |'), '<table>\n<thead>\n<tr>\n<th>a</th>\n<th style="text-align:center">b</th>\n'
    + '</tr>\n</thead>\n<tbody>\n<tr>\n<td>1</td>\n<td style="text-align:center">2</td>\n</tr>\n</tbody>\n</table>\n');
  check('commonmark_preset_no_table', constructed.render('| a |\n| - |'), '<p>| a |\n| - |</p>\n');
  check('tokens', called.parse('# h\n\np', {}).map(token => token.type),
    ['heading_open', 'inline', 'heading_close', 'paragraph_open', 'inline', 'paragraph_close']);
  return { checks };
}
