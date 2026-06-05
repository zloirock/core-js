// Unit tests for `helpers/pattern-matching.js` and `helpers/path-normalize.js`. Both are
// parser-agnostic pure string / data logic - heavily consumed by plugin-options validation
// and entry detection across babel-plugin + unplugin; regressions here surface as silent
// pattern matcher / import-id misnormalisation downstream
import {
  findUniqueName,
  isEntryPattern,
  isModulePattern,
  patternToRegExp,
  safeStringify,
  toStatelessRegExp,
  validatePatternList,
} from '../../packages/core-js-polyfill-provider/helpers/pattern-matching.js';
import {
  WINDOWS_UNC_PREFIX_RE,
  isCoreJSFile,
  lookupEntryModules,
  normalizeImportSource,
  resolveImportPath,
  stripQueryHash,
} from '../../packages/core-js-polyfill-provider/helpers/path-normalize.js';
import {
  buildOffsetToLine,
  buildOffsetToLineColumn,
  mergeVisitors,
  parseDisableDirectives,
} from '../../packages/core-js-polyfill-provider/helpers/source-scan.js';
import { isDirectiveStatement, isFunctionParamDestructureParent, paramListReadsName } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { tagError } from '../../packages/core-js-polyfill-provider/helpers/error-tag.js';
import { createChecker } from './harness.mjs';

const { check, checkTruthy, finish, throwsWith } = createChecker('helpers');

// --- toStatelessRegExp ---

// stateful RegExp (g flag): returns new RegExp without g, same source
{
  const stateless = toStatelessRegExp(/foo/g);
  check('toStatelessRegExp/g flag stripped', stateless.global, false);
  check('toStatelessRegExp/source preserved', stateless.source, 'foo');
}

// y (sticky) flag: also stripped
{
  const stateless = toStatelessRegExp(/foo/y);
  check('toStatelessRegExp/y flag stripped', stateless.sticky, false);
}

// non-stateful already (no g/y): returns same instance (no clone)
{
  const re = /foo/i;
  check('toStatelessRegExp/non-stateful returns same instance', toStatelessRegExp(re), re);
}

// non-RegExp input throws TypeError
throwsWith('toStatelessRegExp/null throws',
  () => toStatelessRegExp(null), '[core-js] toStatelessRegExp: expected RegExp');
throwsWith('toStatelessRegExp/string throws',
  () => toStatelessRegExp('foo'), '[core-js] toStatelessRegExp: expected RegExp');

// --- patternToRegExp ---

// RegExp input: returns stateless copy
{
  const re = patternToRegExp(/es\.array\.at/);
  checkTruthy('patternToRegExp/RegExp input', re instanceof RegExp);
  check('patternToRegExp/RegExp input matches', re.test('es.array.at'), true);
}

// string input compiled with anchors + non-capturing group
{
  const re = patternToRegExp('es\\.array\\.at');
  check('patternToRegExp/string anchored start', re.test('foo es.array.at'), false);
  check('patternToRegExp/string anchored end', re.test('es.array.at foo'), false);
  check('patternToRegExp/string whole match', re.test('es.array.at'), true);
}

// alternation: wraps in non-capturing group so `a|b` matches WHOLE a or WHOLE b
{
  const re = patternToRegExp('es\\.array|es\\.set');
  check('patternToRegExp/alternation whole a', re.test('es.array'), true);
  check('patternToRegExp/alternation whole b', re.test('es.set'), true);
  // without grouping, `^es\.array|es\.set$` would match `xxxes.set`; with grouping it shouldn't
  check('patternToRegExp/alternation prefix-only rejected', re.test('xxxes.set'), false);
}

// empty string returns null (`/^$/` would match zero-length entries, never real module)
check('patternToRegExp/empty string returns null', patternToRegExp(''), null);

// malformed regex source returns null (try-catch around `new RegExp`)
check('patternToRegExp/malformed returns null', patternToRegExp('(unclosed'), null);

// --- isModulePattern / isEntryPattern ---

check('isModulePattern/es. prefix', isModulePattern('es.array.at'), true);
check('isModulePattern/esnext. prefix', isModulePattern('esnext.array.foo'), true);
check('isModulePattern/web. prefix', isModulePattern('web.url'), true);
check('isModulePattern/wildcard contains', isModulePattern('actual/*/at'), true);
check('isModulePattern/RegExp instance', isModulePattern(/foo/), true);
check('isModulePattern/non-string non-regex', isModulePattern(42), false);
check('isModulePattern/entry path (no prefix)', isModulePattern('actual/promise'), false);

check('isEntryPattern/entry path', isEntryPattern('actual/promise'), true);
check('isEntryPattern/module pattern rejected', isEntryPattern('es.array.at'), false);
check('isEntryPattern/wildcard rejected', isEntryPattern('actual/*/at'), false);
check('isEntryPattern/non-string', isEntryPattern(42), false);

// --- safeStringify ---

check('safeStringify/string', safeStringify('foo'), '"foo"');
check('safeStringify/number', safeStringify(42), '42');
check('safeStringify/null', safeStringify(null), 'null');
check('safeStringify/undefined', safeStringify(undefined), undefined);
check('safeStringify/boolean', safeStringify(true), 'true');
check('safeStringify/symbol', safeStringify(Symbol('s')), 'Symbol(s)');
check('safeStringify/bigint', safeStringify(42n), '42n');
check('safeStringify/Infinity', safeStringify(Infinity), 'Infinity');
check('safeStringify/-Infinity', safeStringify(-Infinity), '-Infinity');
check('safeStringify/NaN', safeStringify(NaN), 'NaN');

{
  // function bodies have a return-style statement so eslint's `no-empty-function` doesn't fire
  function namedFn() { return null; }
  check('safeStringify/named function', safeStringify(namedFn), '[Function namedFn]');
  // anonymous arrow body returns undefined explicitly
  check('safeStringify/anonymous arrow', safeStringify(() => undefined), '[Function]');
}

// circular reference: JSON.stringify throws, fallback `[Object]`
{
  const obj = {};
  obj.self = obj;
  check('safeStringify/circular returns fallback', safeStringify(obj), '[Object]');
}

// adversarial function with throwing `.name` getter: returns `[Function]` without crashing
{
  function fn() { return null; }
  Object.defineProperty(fn, 'name', { get() { throw new Error('hostile'); } });
  check('safeStringify/hostile name returns [Function]', safeStringify(fn), '[Function]');
}

// --- validatePatternList ---

// undefined/null/empty array: no-op
checkTruthy('validatePatternList/undefined no-op',
  validatePatternList('include', undefined) === undefined);
checkTruthy('validatePatternList/null no-op',
  validatePatternList('include', null) === undefined);
checkTruthy('validatePatternList/empty array no-op',
  validatePatternList('include', []) === undefined);

// valid list passes
checkTruthy('validatePatternList/valid mixed',
  validatePatternList('include', ['es.array.at', /web\..+/]) === undefined);

// non-array throws
throwsWith('validatePatternList/non-array throws',
  () => validatePatternList('include', 'es.array.at'),
  '`include` must be an array');

// empty string item rejected
throwsWith('validatePatternList/empty string item rejected',
  () => validatePatternList('include', ['ok', '']),
  '`include[*]` must be a non-empty string');

// non-string non-regex item rejected
throwsWith('validatePatternList/number item rejected',
  () => validatePatternList('include', ['ok', 42]),
  '`include[*]` must be a string or RegExp');

// --- findUniqueName ---

// startSuffix=null, prefix free: returns prefix bare
check('findUniqueName/null suffix bare available',
  findUniqueName('_x', null, () => false), '_x');

// startSuffix=null, prefix taken: skips 1, returns _x2
{
  const taken = new Set(['_x']);
  check('findUniqueName/null suffix prefix taken skips 1',
    findUniqueName('_x', null, n => taken.has(n)), '_x2');
}

// startSuffix=null, prefix taken AND _x2 taken: returns _x3
{
  const taken = new Set(['_x', '_x2']);
  check('findUniqueName/null suffix walks past first taken',
    findUniqueName('_x', null, n => taken.has(n)), '_x3');
}

// numeric startSuffix=3: starts at _x3
check('findUniqueName/numeric start=3',
  findUniqueName('_x', 3, () => false), '_x3');

// numeric startSuffix=0: clamped to 2 (skip-1 invariant)
check('findUniqueName/numeric start<2 clamped to 2',
  findUniqueName('_x', 0, () => false), '_x2');
check('findUniqueName/numeric start=1 clamped to 2',
  findUniqueName('_x', 1, () => false), '_x2');

// startSuffix=undefined throws explicitly
throwsWith('findUniqueName/undefined suffix throws',
  () => findUniqueName('_x', undefined, () => false),
  'startSuffix must be null');

// throw message carries `[core-js]` prefix (consistent with sibling helpers)
throwsWith('findUniqueName/undefined suffix throw is core-js-prefixed',
  () => findUniqueName('_x', undefined, () => false),
  '[core-js]');

// negative startSuffix throws RangeError-shape (silent clamp would mask caller bug)
throwsWith('findUniqueName/negative throws non-negative',
  () => findUniqueName('_x', -1, () => false),
  'must be non-negative');
throwsWith('findUniqueName/negative throw is core-js-prefixed',
  () => findUniqueName('_x', -5, () => false),
  '[core-js]');

// non-number startSuffix (string / boolean / object): TypeError, not coerced
throwsWith('findUniqueName/string suffix throws',
  () => findUniqueName('_x', '3', () => false),
  'finite non-negative number');
throwsWith('findUniqueName/boolean suffix throws',
  () => findUniqueName('_x', true, () => false),
  'finite non-negative number');
throwsWith('findUniqueName/object suffix throws',
  () => findUniqueName('_x', {}, () => false),
  'finite non-negative number');

// non-finite startSuffix (NaN, Infinity): TypeError (silent NaN would loop forever)
throwsWith('findUniqueName/NaN suffix throws',
  () => findUniqueName('_x', NaN, () => false),
  'finite non-negative number');
throwsWith('findUniqueName/Infinity suffix throws',
  () => findUniqueName('_x', Infinity, () => false),
  'finite non-negative number');

// conflict scan from numeric start: _x3 taken -> _x4
{
  const taken = new Set(['_x3']);
  check('findUniqueName/numeric start with conflict increments',
    findUniqueName('_x', 3, n => taken.has(n)), '_x4');
}

// large gap: _x5..._x9 taken, returns _x10 (cross 1-digit / 2-digit boundary)
{
  const taken = new Set(['_x5', '_x6', '_x7', '_x8', '_x9']);
  check('findUniqueName/conflict span crosses digit boundary',
    findUniqueName('_x', 5, n => taken.has(n)), '_x10');
}

// --- stripQueryHash ---

check('stripQueryHash/no query passes through', stripQueryHash('foo/bar'), 'foo/bar');
check('stripQueryHash/query suffix stripped', stripQueryHash('foo/bar?t=1'), 'foo/bar');
check('stripQueryHash/hash suffix stripped', stripQueryHash('foo/bar#h'), 'foo/bar');
check('stripQueryHash/Vite import suffix stripped',
  stripQueryHash('foo/bar?import&t=123'), 'foo/bar');

// Windows UNC long-path: `\\?\` prefix preserved, query inside not detected
check('stripQueryHash/UNC long-path preserved',
  stripQueryHash('\\\\?\\C:\\foo'), '\\\\?\\C:\\foo');
// Windows device path: `\\.\` preserved
check('stripQueryHash/UNC device path preserved',
  stripQueryHash('\\\\.\\COM1'), '\\\\.\\COM1');
// forward-slash UNC: `//?/` preserved (Vite/Rollup path-normalization stage)
check('stripQueryHash/forward UNC preserved',
  stripQueryHash('//?/C:/foo'), '//?/C:/foo');

// --- normalizeImportSource ---

// lowercase + forward slashes
check('normalizeImportSource/Windows backslash to forward',
  normalizeImportSource('Core-JS\\Actual\\Promise'), 'core-js/actual/promise');
// duplicate slashes collapsed (Farm artifact)
check('normalizeImportSource/duplicate slashes collapsed',
  normalizeImportSource('core-js//actual///promise'), 'core-js/actual/promise');
// query/hash stripped
check('normalizeImportSource/strip query',
  normalizeImportSource('core-js/actual/promise?t=1'), 'core-js/actual/promise');
// UNC prefix stripped before slash collapse
check('normalizeImportSource/UNC forward stripped',
  normalizeImportSource('//?/C:/foo'), 'c:/foo');

// --- WINDOWS_UNC_PREFIX_RE ---

checkTruthy('WINDOWS_UNC_PREFIX_RE matches //?/', WINDOWS_UNC_PREFIX_RE.test('//?/'));
checkTruthy('WINDOWS_UNC_PREFIX_RE matches //./', WINDOWS_UNC_PREFIX_RE.test('//./'));
check('WINDOWS_UNC_PREFIX_RE rejects //x/', WINDOWS_UNC_PREFIX_RE.test('//x/'), false);
check('WINDOWS_UNC_PREFIX_RE rejects bare //', WINDOWS_UNC_PREFIX_RE.test('//'), false);

// --- lookupEntryModules ---

// known full prefix entry
{
  const result = lookupEntryModules('actual/promise');
  checkTruthy('lookupEntryModules/known entry returns array', Array.isArray(result));
}

// known bare entry (top-level)
{
  const result = lookupEntryModules('actual');
  checkTruthy('lookupEntryModules/actual top entry', Array.isArray(result));
}

// unknown entry returns null
check('lookupEntryModules/unknown returns null', lookupEntryModules('totally-not-real-xyz'), null);

// non-string returns null
check('lookupEntryModules/non-string returns null', lookupEntryModules(42), null);

// prototype-chain access guarded: `constructor` / `toString` / `__proto__` return null
// not the prototype's own value
check('lookupEntryModules/constructor guarded', lookupEntryModules('constructor'), null);
check('lookupEntryModules/toString guarded', lookupEntryModules('toString'), null);
check('lookupEntryModules/__proto__ guarded', lookupEntryModules('__proto__'), null);

// --- resolveImportPath ---

// absoluteImports=false: returns plain `pkg/subpath`
check('resolveImportPath/relative path',
  resolveImportPath('core-js', 'actual/promise', false), 'core-js/actual/promise');
check('resolveImportPath/default false',
  resolveImportPath('core-js', 'actual/promise'), 'core-js/actual/promise');

// absoluteImports=true with unknown package: falls back to `pkg/subpath`
check('resolveImportPath/absoluteImports unknown falls back',
  resolveImportPath('totally-not-a-real-package-xyz', 'foo', true),
  'totally-not-a-real-package-xyz/foo');

// --- isCoreJSFile ---

// core-js internals
check('isCoreJSFile/core-js/internals path', isCoreJSFile('node_modules/core-js/internals/foo.js'), true);
check('isCoreJSFile/core-js/modules path', isCoreJSFile('core-js/modules/es.array.at.js'), true);
check('isCoreJSFile/core-js-pure/actual path', isCoreJSFile('core-js-pure/actual/promise.js'), true);
check('isCoreJSFile/@core-js/pure path', isCoreJSFile('@core-js/pure/actual/promise.js'), true);
check('isCoreJSFile/core-js-bundle root', isCoreJSFile('node_modules/core-js-bundle/index.js'), true);
check('isCoreJSFile/@core-js/bundle root', isCoreJSFile('node_modules/@core-js/bundle/index.js'), true);

// canonical form: backslashes / case / queries handled via normalizeImportSource
check('isCoreJSFile/Windows backslashes',
  isCoreJSFile('node_modules\\core-js\\modules\\es.array.at.js'), true);
check('isCoreJSFile/Uppercase path',
  isCoreJSFile('node_modules/Core-JS/MODULES/es.array.at.js'), true);

// non-core-js paths
check('isCoreJSFile/user code', isCoreJSFile('src/index.js'), false);
check('isCoreJSFile/lodash', isCoreJSFile('node_modules/lodash/chunk.js'), false);
check('isCoreJSFile/non-string', isCoreJSFile(42), false);
check('isCoreJSFile/empty string', isCoreJSFile(''), false);

// `core-js/index.js` root entry classified as internal (not a transformable user file)
check('isCoreJSFile/core-js root index', isCoreJSFile('node_modules/core-js/index.js'), true);

// --- buildOffsetToLine ---

// empty code: only line 1 exists
{
  const offsetToLine = buildOffsetToLine('');
  check('buildOffsetToLine/empty offset 0', offsetToLine(0), 1);
}

// single line LF: line 1 within range, line 2 after newline
{
  const offsetToLine = buildOffsetToLine('foo\nbar');
  check('buildOffsetToLine/LF line 1', offsetToLine(0), 1);
  check('buildOffsetToLine/LF line 1 last char', offsetToLine(2), 1);
  check('buildOffsetToLine/LF after newline -> line 2', offsetToLine(4), 2);
}

// CR-only (no following LF): treated as line break
{
  const offsetToLine = buildOffsetToLine('foo\rbar');
  check('buildOffsetToLine/CR line 1', offsetToLine(0), 1);
  check('buildOffsetToLine/CR after -> line 2', offsetToLine(4), 2);
}

// CRLF: only LF half advances line (CR + LF treated as single break)
{
  const offsetToLine = buildOffsetToLine('foo\r\nbar');
  check('buildOffsetToLine/CRLF after -> line 2', offsetToLine(5), 2);
}

// U+2028 (line separator) and U+2029 (paragraph separator)
{
  const offsetToLine = buildOffsetToLine('foo\u2028bar\u2029baz');
  check('buildOffsetToLine/U+2028 advances line', offsetToLine(4), 2);
  check('buildOffsetToLine/U+2029 advances line', offsetToLine(8), 3);
}

// multi-line: each break advances by 1
{
  const offsetToLine = buildOffsetToLine('a\nb\nc\nd');
  check('buildOffsetToLine/line 4', offsetToLine(6), 4);
}

// --- buildOffsetToLineColumn ---

// 1-based line + column; both reset at every line terminator. shared lineStarts table
// drives O(log n) lookup, so this is the canonical helper for diagnostic position output
{
  const pos = buildOffsetToLineColumn('foo\nbar');
  check('buildOffsetToLineColumn/LF line 1 col 1', JSON.stringify(pos(0)), '{"line":1,"column":1}');
  check('buildOffsetToLineColumn/LF line 1 last char', JSON.stringify(pos(2)), '{"line":1,"column":3}');
  check('buildOffsetToLineColumn/LF line 2 col 1', JSON.stringify(pos(4)), '{"line":2,"column":1}');
}

// CRLF: column resets after the LF half (CR + LF still counted as one terminator)
{
  const pos = buildOffsetToLineColumn('foo\r\nbar');
  check('buildOffsetToLineColumn/CRLF line 2 col 1', JSON.stringify(pos(5)), '{"line":2,"column":1}');
}

// U+2028 / U+2029 advance the line just like LF. literal escape sequences in source
// are forbidden by `es/no-json-superset`; build via `String.fromCharCode` so the file
// stays ASCII while the runtime string still carries the ES line-terminator code points
{
  const ls = String.fromCharCode(0x2028);
  const ps = String.fromCharCode(0x2029);
  const pos = buildOffsetToLineColumn(`a${ ls }b${ ps }c`);
  check('buildOffsetToLineColumn/U+2028 line 2', JSON.stringify(pos(2)), '{"line":2,"column":1}');
  check('buildOffsetToLineColumn/U+2029 line 3', JSON.stringify(pos(4)), '{"line":3,"column":1}');
}

// offset === code.length: valid EOF anchor; offset must NOT report past-EOF as out-of-range
{
  const pos = buildOffsetToLineColumn('abc');
  check('buildOffsetToLineColumn/EOF anchor', JSON.stringify(pos(3)), '{"line":1,"column":4}');
}

// non-integer / out-of-range offsets return null so callers can skip the location chunk
{
  const pos = buildOffsetToLineColumn('abc');
  check('buildOffsetToLineColumn/null offset', pos(null), null);
  check('buildOffsetToLineColumn/undefined offset', pos(undefined), null);
  check('buildOffsetToLineColumn/negative offset', pos(-1), null);
  check('buildOffsetToLineColumn/past-EOF offset', pos(10), null);
  check('buildOffsetToLineColumn/fractional offset', pos(1.5), null);
  check('buildOffsetToLineColumn/NaN offset', pos(NaN), null);
}

// empty source: only offset 0 is in range and maps to line 1 col 1
{
  const pos = buildOffsetToLineColumn('');
  check('buildOffsetToLineColumn/empty offset 0', JSON.stringify(pos(0)), '{"line":1,"column":1}');
  check('buildOffsetToLineColumn/empty past-EOF', pos(1), null);
}

// --- mergeVisitors ---

// no overlap: merge keeps both
{
  const a = { CallExpression: () => 'a' };
  const b = { MemberExpression: () => 'b' };
  const merged = mergeVisitors(a, b);
  checkTruthy('mergeVisitors/no overlap keeps both',
    merged.CallExpression && merged.MemberExpression);
}

// overlap with function shorthand on both: chained as enter
{
  const calls = [];
  const merged = mergeVisitors(
    { Foo: () => calls.push('a') },
    { Foo: () => calls.push('b') },
  );
  merged.Foo.enter();
  checkTruthy('mergeVisitors/function shorthand chained',
    calls.length === 2 && calls[0] === 'a' && calls[1] === 'b');
}

// overlap with { enter, exit } shape: phase-aligned chaining
{
  const log = [];
  const merged = mergeVisitors(
    { Foo: { enter: () => log.push('aE'), exit: () => log.push('aX') } },
    { Foo: { enter: () => log.push('bE'), exit: () => log.push('bX') } },
  );
  merged.Foo.enter();
  merged.Foo.exit();
  checkTruthy('mergeVisitors/enter+exit chained per phase',
    log.length === 4 && log[0] === 'aE' && log[1] === 'bE' && log[2] === 'aX' && log[3] === 'bX');
}

// only one side has the phase: kept as-is
{
  const merged = mergeVisitors(
    { Foo: { enter: () => 'a-enter' } },
    { Foo: { exit: () => 'b-exit' } },
  );
  checkTruthy('mergeVisitors/different phases preserved',
    typeof merged.Foo.enter === 'function' && typeof merged.Foo.exit === 'function');
}

// `$` metadata: shallow merge
{
  const merged = mergeVisitors(
    { $: { scope: true } },
    { $: { other: 'flag' } },
  );
  checkTruthy('mergeVisitors/$ metadata shallow-merged',
    merged.$.scope === true && merged.$.other === 'flag');
}

// null handler on either side: treated as no-op (no crash)
{
  const fn = () => 'kept';
  const merged = mergeVisitors({ Foo: fn }, { Foo: null });
  check('mergeVisitors/null in extra preserves base', merged.Foo, fn);
}
{
  const fn = () => 'kept';
  const merged = mergeVisitors({ Foo: null }, { Foo: fn });
  check('mergeVisitors/null in base accepts extra', merged.Foo, fn);
}

// empty objects on both sides: key dropped (avoid crashable empty handler)
{
  const merged = mergeVisitors({ Foo: {} }, { Foo: {} });
  check('mergeVisitors/empty both drops key', merged.Foo, undefined);
}

// --- parseDisableDirectives ---

// no comments: returns null
check('parseDisableDirectives/no comments', parseDisableDirectives({ comments: null }), null);
check('parseDisableDirectives/empty array', parseDisableDirectives({ comments: [] }), null);

// `core-js-disable-file` above first statement: returns true
{
  const result = parseDisableDirectives({
    comments: [{ value: ' core-js-disable-file', end: 25 }],
    firstStmtStart: 50,
  });
  check('parseDisableDirectives/disable-file above first stmt', result, true);
}
{
  // firstStmtStart undefined: file directive always wins
  const result = parseDisableDirectives({
    comments: [{ value: 'core-js-disable-file', end: 50 }],
    firstStmtStart: undefined,
  });
  check('parseDisableDirectives/disable-file with no firstStmtStart', result, true);
}
{
  // disable-file BELOW first statement: ignored (not a file-scope directive)
  const result = parseDisableDirectives({
    comments: [{ value: 'core-js-disable-file', end: 100 }],
    firstStmtStart: 50,
  });
  check('parseDisableDirectives/disable-file below first stmt ignored', result, null);
}

// `core-js-disable-line` with `loc`: adds the line itself
{
  const result = parseDisableDirectives({
    comments: [{ value: 'core-js-disable-line', loc: { start: { line: 5 }, end: { line: 5 } } }],
  });
  checkTruthy('parseDisableDirectives/disable-line via loc',
    result instanceof Set && result.has(5));
}

// `core-js-disable-line` via offsetToLine fallback when loc missing
{
  const offsetToLine = buildOffsetToLine('line1\nline2\nline3');
  const result = parseDisableDirectives({
    comments: [{ value: 'core-js-disable-line', start: 6, end: 11 }],
    offsetToLine,
  });
  checkTruthy('parseDisableDirectives/disable-line via offsetToLine',
    result instanceof Set && result.has(2));
}

// `core-js-disable-next-line`: adds the FOLLOWING line
{
  const result = parseDisableDirectives({
    comments: [{ value: 'core-js-disable-next-line', loc: { start: { line: 3 }, end: { line: 3 } } }],
  });
  checkTruthy('parseDisableDirectives/disable-next-line adds next',
    result instanceof Set && result.has(4));
}

// comment without directive: ignored
check('parseDisableDirectives/foreign comment ignored',
  parseDisableDirectives({ comments: [{ value: ' just a regular comment', end: 10 }] }), null);

// comment missing both loc and offsetToLine: skipped silently
check('parseDisableDirectives/no loc no offsetToLine skipped',
  parseDisableDirectives({ comments: [{ value: 'core-js-disable-line' }] }), null);

// JSDoc multi-line continuation: `m` flag picks up directive on continuation line
{
  const result = parseDisableDirectives({
    comments: [{
      value: '*\n * regular\n * core-js-disable-line\n ',
      loc: { start: { line: 1 }, end: { line: 4 } },
    }],
  });
  checkTruthy('parseDisableDirectives/JSDoc continuation directive recognised',
    result instanceof Set && result.size > 0);
}

// --- tagError ---

// happy path: stamps `[core-js] [tag] ` prefix on string `.message`
{
  const error = new Error('boom');
  tagError(error, 'input.ts');
  check('tagError/stamps prefix', error.message, '[core-js] [input.ts] boom');
}

// idempotent: already-tagged messages are not double-stamped
{
  const error = new Error('[core-js] [input.ts] already tagged');
  tagError(error, 'input.ts');
  check('tagError/idempotent on same tag', error.message, '[core-js] [input.ts] already tagged');
}

// bare `[core-js]` (no `[tag]`) does NOT block re-tagging: file marker still useful
{
  const error = new Error('[core-js] inner callback failed');
  tagError(error, 'input.ts');
  check('tagError/re-tags bare core-js prefix', error.message,
    '[core-js] [input.ts] [core-js] inner callback failed');
}

// non-string tag: defensive short-circuit (caller plumbing typo would otherwise stringify)
{
  const error = new Error('boom');
  tagError(error, undefined);
  check('tagError/undefined tag skips', error.message, 'boom');
  tagError(error, null);
  check('tagError/null tag skips', error.message, 'boom');
  tagError(error, 42);
  check('tagError/number tag skips', error.message, 'boom');
}

// non-string `.message`: user Error subclass with object message, missing-message object
{
  const error = { message: { code: 'EBUSY' } };
  tagError(error, 'input.ts');
  check('tagError/object message skips', JSON.stringify(error.message), '{"code":"EBUSY"}');
  // a primitive `throw 'oops'` arrives at catch as the string itself; `.message`
  // on a String / Number / plain object lookup is `undefined`, which hits the same
  // typeof short-circuit
  const noMessage = {};
  tagError(noMessage, 'input.ts');
  check('tagError/undefined message skips', noMessage.message, undefined);
}

// null / undefined error: no crash (defensive)
{
  let crashed = false;
  try {
    tagError(null, 'input.ts');
    tagError(undefined, 'input.ts');
  } catch { crashed = true; }
  check('tagError/null/undefined error survives', crashed, false);
}

// frozen Error instance: TypeError on assignment swallowed, original message preserved
{
  const error = new Error('frozen original');
  Object.freeze(error);
  tagError(error, 'input.ts');
  check('tagError/frozen error preserves message', error.message, 'frozen original');
}

// hostile `get message()` throws: tagError must NOT unwind (would lose the original error
// downstream); read is wrapped, message is left untouched and identity preserved
{
  const error = Object.create(null);
  Object.defineProperty(error, 'message', { get() { throw new Error('hostile'); } });
  let crashed = false;
  try {
    tagError(error, 'input.ts');
  } catch {
    crashed = true;
  }
  check('tagError/hostile message getter does not unwind', crashed, false);
}

// hostile getter + thrown error identity check: the caller can still rethrow the original
{
  const original = Object.create(null);
  Object.defineProperty(original, 'message', { get() { throw new Error('hostile'); } });
  let caught;
  try {
    try {
      throw original;
    } catch (error) {
      tagError(error, 'input.ts');
      throw error;
    }
  } catch (error) {
    caught = error;
  }
  check('tagError/hostile message preserves original identity', caught, original);
}

// empty tag string: accepted (not blocked by the typeof gate), produces `[core-js] [] msg`
{
  const error = new Error('boom');
  tagError(error, '');
  check('tagError/empty tag stamps without crash', error.message, '[core-js] [] boom');
}

// tag with regex meta chars: prefix check is a literal substring match, no injection.
// `.+?` / `[/.+?^$]` would interpret as regex alternation if includes ever switched to
// pattern matching - guard against that by asserting both stamp and idempotent re-tag
{
  const error = new Error('boom');
  tagError(error, '[/.+?^$]');
  check('tagError/regex meta tag stamps literally', error.message, '[core-js] [[/.+?^$]] boom');
  tagError(error, '[/.+?^$]');
  check('tagError/regex meta tag idempotent', error.message, '[core-js] [[/.+?^$]] boom');
}

// custom error subclass without stack: tagging works (no stack interaction)
{
  class CustomError extends Error {
    constructor(message, options) {
      super(message, options);
      this.name = 'CustomError';
      delete this.stack;
    }
  }
  const error = new CustomError('custom boom');
  tagError(error, 'input.ts');
  check('tagError/custom error class without stack', error.message, '[core-js] [input.ts] custom boom');
}

// mid-message `[tag]` does NOT block re-stamping (only head-anchored prefix matches).
// previous `includes` semantics would have skipped this; startsWith correctly stamps
{
  const error = new Error('failure at [input.ts] during phase 2');
  tagError(error, 'input.ts');
  check('tagError/mid-message tag does not block', error.message,
    '[core-js] [input.ts] failure at [input.ts] during phase 2');
}

// already head-tagged: skip (idempotent at outer wrapper rethrow)
{
  const error = new Error('[core-js] [input.ts] boom');
  tagError(error, 'input.ts');
  check('tagError/head-tagged idempotent', error.message, '[core-js] [input.ts] boom');
}

// head-tagged with DIFFERENT tag: re-stamp (outer wrapper sees a different file context).
// startsWith on the new tag's prefix fails -> outer stamp prepends
{
  const error = new Error('[core-js] [inner.ts] inner failure');
  tagError(error, 'outer.ts');
  check('tagError/head-tagged different tag re-stamps', error.message,
    '[core-js] [outer.ts] [core-js] [inner.ts] inner failure');
}

// --- isFunctionParamDestructureParent ---

// minimal path-like shape: `.node` + `.parentPath`. parser-agnostic helper exposed in
// `ast-patterns.js`; depth cap (32) + cycle detection live in the function itself, so
// synthetic paths exercise the throw without needing a real parser run
{
  // legitimate nested ObjectPattern in function param: `function({ outer: { inner } }) {}`
  // chain bottom-up: inner ObjectPattern -> ObjectProperty.value -> outer ObjectPattern ->
  // FunctionDeclaration.params[0]
  function buildPath(node, parentPath) {
    return { node, parentPath };
  }
  const innerOP = { type: 'ObjectPattern', properties: [] };
  const valueProp = { type: 'ObjectProperty', value: innerOP };
  const outerOP = { type: 'ObjectPattern', properties: [valueProp] };
  const fnDecl = { type: 'FunctionDeclaration', params: [outerOP] };
  const innerPath = buildPath(innerOP,
    buildPath(valueProp,
      buildPath(outerOP,
        buildPath(fnDecl, null))));
  checkTruthy('isFunctionParamDestructureParent/normal nested ObjectPattern',
    isFunctionParamDestructureParent(innerPath));
}

// 40-deep ObjectPattern chain with no function-like ancestor: depth cap (32) throws
// with `[core-js]` prefix. each hop is `ObjectPattern.properties` -> prev (transparent
// wrapper case), no break case fires until cap trips
{
  // build path chain from innermost outward: at the end, innermost's parentPath chain
  // reaches 40 ObjectPattern wrappers - more than the depth cap of 32
  const innerOP = { type: 'ObjectPattern', properties: [] };
  const innerPath = { node: innerOP, parentPath: null };
  let currentPath = innerPath;
  let prevNode = innerOP;
  for (let i = 0; i < 40; i++) {
    const wrapperNode = { type: 'ObjectPattern', properties: [prevNode] };
    const wrapperPath = { node: wrapperNode, parentPath: null };
    currentPath.parentPath = wrapperPath;
    currentPath = wrapperPath;
    prevNode = wrapperNode;
  }
  let crashed = false;
  let message = '';
  try {
    isFunctionParamDestructureParent(innerPath);
  } catch (error) {
    crashed = true;
    message = error.message;
  }
  checkTruthy('isFunctionParamDestructureParent/depth cap throws on deep nest', crashed);
  checkTruthy('isFunctionParamDestructureParent/depth cap throw is core-js-prefixed',
    message.includes('[core-js]'));
  checkTruthy('isFunctionParamDestructureParent/depth cap mentions cycle reason',
    message.includes('exceeds 32 levels'));
}

// shallow non-function-param ObjectPattern: `const { x } = obj` -> VariableDeclarator,
// not a function-like owner. helper returns false (no throw)
{
  const objectPattern = { type: 'ObjectPattern', properties: [] };
  const declarator = { type: 'VariableDeclarator', id: objectPattern };
  const path = { node: objectPattern, parentPath: { node: declarator, parentPath: null } };
  check('isFunctionParamDestructureParent/non-param destructure returns false',
    isFunctionParamDestructureParent(path), false);
}

// --- paramListReadsName ---

// param-position read detection guarding param-destructure body-extract. synthetic param
// nodes (no parser needed) - the helper is a pure structural walk over `.params`
{
  const id = name => ({ type: 'Identifier', name });
  const ofBinding = { type: 'ObjectProperty', key: id('of'), value: id('of'), computed: false, shorthand: true };
  const restEl = { type: 'RestElement', argument: id('rest') };
  const dflt = (name, right) => ({
    type: 'ObjectProperty', key: id(name), computed: false,
    value: { type: 'AssignmentPattern', left: id(name), right },
  });

  // `{ of, dflt = of, ...rest } = Array` - sibling in-pattern default reads `of`
  const patternDefaultReadsOf = [{
    type: 'AssignmentPattern',
    left: { type: 'ObjectPattern', properties: [ofBinding, dflt('dflt', id('of')), restEl] },
    right: id('Array'),
  }];
  checkTruthy('paramListReadsName/in-pattern default reads binding',
    paramListReadsName(patternDefaultReadsOf, 'of'));

  // the binding declaration itself is never counted as a read
  check('paramListReadsName/bare binding is not a read',
    paramListReadsName([{
      type: 'AssignmentPattern',
      left: { type: 'ObjectPattern', properties: [ofBinding, restEl] },
      right: id('Array'),
    }], 'of'), false);

  // later top-level param default reads an earlier param binding: `({ of } = Array, y = of)`
  checkTruthy('paramListReadsName/later param default reads binding',
    paramListReadsName([
      { type: 'AssignmentPattern', left: { type: 'ObjectPattern', properties: [ofBinding] }, right: id('Array') },
      { type: 'AssignmentPattern', left: id('y'), right: id('of') },
    ], 'of'));

  // ArrayPattern element default reads a sibling element binding: `[of, y = of]`
  checkTruthy('paramListReadsName/array-pattern element default reads binding',
    paramListReadsName([{
      type: 'ArrayPattern',
      elements: [id('of'), { type: 'AssignmentPattern', left: id('y'), right: id('of') }],
    }], 'of'));

  // computed key reads the binding: `{ of, [of]: picked }`
  checkTruthy('paramListReadsName/computed key reads binding',
    paramListReadsName([{
      type: 'ObjectPattern',
      properties: [ofBinding, { type: 'ObjectProperty', key: id('of'), value: id('picked'), computed: true }],
    }], 'of'));

  // a default-position closure captures the param binding: `{ p = () => of }`
  checkTruthy('paramListReadsName/nested closure default reads binding',
    paramListReadsName([{
      type: 'ObjectPattern',
      properties: [dflt('p', { type: 'ArrowFunctionExpression', params: [], body: id('of') })],
    }], 'of'));

  // estree `Property` node type behaves like babel `ObjectProperty`
  checkTruthy('paramListReadsName/estree Property default reads binding',
    paramListReadsName([{
      type: 'ObjectPattern',
      properties: [{
        type: 'Property', key: id('dflt'), computed: false,
        value: { type: 'AssignmentPattern', left: id('dflt'), right: id('of') },
      }],
    }], 'of'));

  // negative: default reads a DIFFERENT name, not the queried binding
  check('paramListReadsName/default reads unrelated name',
    paramListReadsName([{ type: 'ObjectPattern', properties: [ofBinding, dflt('dflt', id('seed'))] }], 'of'), false);

  // negative: a non-computed member property is a name, not a read (`{ p = x.of }`)
  check('paramListReadsName/non-computed member property is not a read',
    paramListReadsName([{
      type: 'ObjectPattern',
      properties: [dflt('p', { type: 'MemberExpression', object: id('x'), property: id('of'), computed: false })],
    }], 'of'), false);

  // guards
  check('paramListReadsName/empty params', paramListReadsName([], 'of'), false);
  check('paramListReadsName/empty name', paramListReadsName(patternDefaultReadsOf, ''), false);
  check('paramListReadsName/non-array params', paramListReadsName(null, 'of'), false);
}

// --- isDirectiveStatement (widened: `.directive` marker on the statement OR the inner literal) ---
// oxc + babel real directives carry `.directive` on the ExpressionStatement
check('isDirectiveStatement/stmt marker', isDirectiveStatement({ type: 'ExpressionStatement', directive: 'use strict' }), true);
// sibling-plugin synth shape: marker on the inner StringLiteral / Literal instead of the statement
check('isDirectiveStatement/inner-literal marker',
  isDirectiveStatement({ type: 'ExpressionStatement', expression: { type: 'Literal', value: 'use strict', directive: 'use strict' } }), true);
// empty-string directive is not a valid prologue token in either slot
check('isDirectiveStatement/empty stmt marker', isDirectiveStatement({ type: 'ExpressionStatement', directive: '' }), false);
check('isDirectiveStatement/empty inner marker',
  isDirectiveStatement({ type: 'ExpressionStatement', expression: { type: 'Literal', value: '', directive: '' } }), false);
// a bare non-directive string-literal statement must NOT qualify (would wrongly extend the import region)
check('isDirectiveStatement/non-directive string',
  isDirectiveStatement({ type: 'ExpressionStatement', expression: { type: 'Literal', value: 'foo' } }), false);
check('isDirectiveStatement/non-expression-statement', isDirectiveStatement({ type: 'ReturnStatement' }), false);
check('isDirectiveStatement/nullish', isDirectiveStatement(null), false);

finish();
