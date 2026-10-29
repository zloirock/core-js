// xregexp: named groups and named replacement tokens, free spacing, `\p{L}` expanded to ranges without a
// native `u` flag, balanced matching, unions, splitting, escaping. Expected values follow from the inputs and
// XRegExp's documented API.
//
// Its reason is a library already compiled against core-js 3: the `lib` build - imported by path, because the
// package's `module` field names its untranspiled `src` - requires 15 `core-js-stable` modules of
// `@babel/runtime-corejs3`, so core-js-pure 3 ships in the same bundle as the core-js 4 the providers inject.
// Eight of the 15 change what the checks see: with any of them answering wrong, the run throws or reddens.
import XRegExp from 'xregexp/lib/index.js';
import { checker } from './checks.mjs';

export function run() {
  const { checks, check } = checker();
  const date = XRegExp('(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})');
  const match = XRegExp.exec('on 2024-03-17 ok', date);
  check('named', [match.groups.year, match.index], ['2024', 3]);
  check('replace', XRegExp.replace('2024-03-17', date, '$<day>/$<month>/$<year>'), '17/03/2024');
  const free = XRegExp('^ (?<word> [a-z]+ ) \\s+ (?<number> \\d+ ) $', 'x');
  check('free_spacing', XRegExp.exec('abc 42', free).groups.number, '42');
  check('unicode_letters', XRegExp.match('Привет, мир! ok', XRegExp('\\p{L}+'), 'all'), ['Привет', 'мир', 'ok']);
  check('recursive', XRegExp.matchRecursive('(a(b)c)(d)', '\\(', '\\)', 'g'), ['a(b)c', 'd']);
  // the backreferenced parts built by XRegExp, which `union` renumbers when it joins them
  check('union', XRegExp.union(['a+b*c', XRegExp('(dogs)\\1'), XRegExp('(cats)\\1')], 'i').test('DOGSdogs'), true);
  check('split_escape', [XRegExp.split('a1b2c', /\d/), XRegExp.escape('a.b*c')], [['a', 'b', 'c'], 'a\\.b\\*c']);
  return { checks };
}
