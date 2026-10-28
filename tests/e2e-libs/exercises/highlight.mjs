// highlight.js: every grammar without the `u` flag compiled, then nested scopes, a sub-language inside a
// template literal, interpolation, case-insensitive matching, auto-detection over a subset and aliases. The
// markup is highlight.js's own: its `hljs-` classes, the trailing underscores of a nested scope,
// `language-` for a sub-language, `&quot;` for a quote.
//
// Its reason is TOPOLOGY: CommonJS at a width nothing else in the corpus has. The package's `import` entry
// is a wrapper over `lib/index.js`, which `require`s the core and one module per grammar - 193 - and
// registers each, which runs its definition at load. In the babel-plugin `usage-global` cell 90 of those
// modules take an injection, the core and 89 grammars; the rest of the corpus has 19 CommonJS modules that
// do, in three libraries. highlight.js fails quietly by default, so the checks read for it: a definition that throws
// at load is registered as the plain-text stand-in, and an error while matching hands back the code
// escaped, without markup. Compiling a grammar is outside that net - a pattern the engine refuses throws.
//
// Grammars that set `unicodeRegex` compile with the `u` flag, which IE11 refuses, so the compile pass
// skips them by that flag.
import hljs from 'highlight.js';
import { checker } from './checks.mjs';

function html(code, language) {
  return hljs.highlight(code, { language }).value;
}

export function run() {
  const { checks, check } = checker();
  const names = hljs.listLanguages();
  check('registered', names.filter(name => hljs.getLanguage(name).name === 'Plain text'), ['plaintext']);
  const failed = [];
  names.filter(name => !hljs.getLanguage(name).unicodeRegex).forEach(name => {
    try {
      const { errorRaised } = hljs.highlight('', { language: name });
      if (errorRaised) failed.push(`${ name }: ${ errorRaised.message }`);
    } catch (error) {
      failed.push(`${ name }: ${ error.message }`);
    }
  });
  check('compiled', failed, []);

  const js = html('class A extends B { m() { return this; } }', 'javascript');
  check('nested_scope', [
    js.indexOf('<span class="hljs-title class_">A</span>') !== -1,
    js.indexOf('<span class="hljs-title class_ inherited__">B</span>') !== -1,
    js.indexOf('<span class="hljs-variable language_">this</span>') !== -1,
  ], [true, true, true]);
  const css = html('const s = css`a { color: red; }`;', 'javascript');
  check('sublanguage', [css.indexOf('<span class="language-css">') !== -1, css.indexOf('<span class="hljs-attribute">color</span>') !== -1],
    [true, true]);
  check('interpolation', html('"s#{a}"', 'ruby'), '<span class="hljs-string">&quot;s<span class="hljs-subst">#{a}</span>&quot;</span>');
  // two mechanisms: CSS property names are a pattern compiled with the `i` flag, SQL keywords a
  // lower-cased table each word is folded into
  check('case_insensitive', [html('a { COLOR: red; }', 'css'), html('SELECT a FROM t', 'sql')], [
    '<span class="hljs-selector-tag">a</span> { <span class="hljs-attribute">COLOR</span>: red; }',
    '<span class="hljs-keyword">SELECT</span> a <span class="hljs-keyword">FROM</span> t',
  ]);
  // two inputs with different winners over one subset, so neither the subset's order nor a constant
  // answer picks both
  check('auto', ['<?php echo $x; ?>', 'fn main() { let mut v: Vec<i32> = Vec::new(); println!("{}", v.len()); }']
    .map(code => hljs.highlightAuto(code, ['go', 'ruby', 'php', 'rust']).language), ['php', 'rust']);
  hljs.registerAliases(['rusty'], { languageName: 'rust' });
  check('aliases', [hljs.getLanguage('rs') === hljs.getLanguage('rust'), hljs.getLanguage('rusty') === hljs.getLanguage('rust'), hljs.getLanguage('nope')],
    [true, true, undefined]);
  return { checks };
}
