// minimatch: globs matched against a fixed file list - globstar, braces, extglobs nested and negated,
// negation, `nocase` - plus the compiled `Minimatch` set, `makeRe` and escaping. Which paths match is
// bash's glob semantics with `globstar`, `extglob`, `dotglob` and `nocasematch`; the leading `!` that
// negates a whole pattern is minimatch's own, as are the shape of `set` / `globParts`, the flags of
// `makeRe` and the backslash form of `escape`.
//
// Its reason is the SYNTAX axis: private STATIC methods, which the corpus spells nowhere. The extglob
// AST is parsed by `static #parseAST` and each literal run of it compiled by `static #parseGlob`, both
// called through the class alias the TS emit keeps (`_a.#parseAST(...)`). Both run here and both hold:
// a `#parseAST` that builds nothing reddens `extglob`, `nested_extglob` and `make_re` (`set` reads only
// the brace expansion), a `#parseGlob` that compiles a run as plain text reddens all but two.
//
// No POSIX class (`[[:alpha:]]`): only that sets the `u` flag on the RegExp minimatch builds at run time.
import { minimatch, Minimatch, makeRe, escape, unescape } from 'minimatch';
import { checker } from './checks.mjs';

const FILES = ['src/a.js', 'src/b.ts', 'src/deep/c.js', 'test/a.spec.js', 'README.md', '.hidden/x.js', 'src/a.min.js'];

function match(pattern, options) {
  return FILES.filter(file => minimatch(file, pattern, options));
}

export function run() {
  const { checks, check } = checker();
  check('globstar', [match('src/**/*.js'), match('**/*.js', { dot: true }).length], [['src/a.js', 'src/deep/c.js', 'src/a.min.js'], 5]);
  check('braces', [match('src/*.{js,ts}'), match('{src,test}/a*')], [['src/a.js', 'src/b.ts', 'src/a.min.js'], ['src/a.js', 'test/a.spec.js', 'src/a.min.js']]);
  check('extglob', [match('src/!(*.min).js'), match('**/+(a|c).js'), match('*.@(md|txt)'), minimatch('aaab', '*(a)b'), minimatch('ab', '?(a)b')],
    [['src/a.js'], ['src/a.js', 'src/deep/c.js'], ['README.md'], true, true]);
  check('nested_extglob', [minimatch('foo.bar.js', '+(foo|bar).!(baz).js'), minimatch('foo.baz.js', '+(foo|bar).!(baz).js')], [true, false]);
  check('negate', [match('!src/**'), minimatch('README.MD', '*.md', { nocase: true })], [['test/a.spec.js', 'README.md', '.hidden/x.js'], true]);

  const mm = new Minimatch('src/{a,b}/**/*.@(js|ts)');
  check('set', [mm.set.length, mm.globParts.map(parts => parts.join('/')), mm.hasMagic()], [2, ['src/a/**/*.@(js|ts)', 'src/b/**/*.@(js|ts)'], true]);
  const re = makeRe('*.+(js|ts)');
  check('make_re', [re.test('x.js'), re.test('x.css'), re.flags], [true, false, '']);
  check('escape', [escape('a*[b]?.js'), unescape('a\\*\\[b\\]\\?.js'), minimatch('a*.js', escape('a*.js')), minimatch('ab.js', escape('a*.js'))],
    ['a\\*\\[b\\]\\?.js', 'a*[b]?.js', true, false]);
  return { checks };
}
