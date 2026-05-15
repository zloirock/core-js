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
  mergeVisitors,
  parseDisableDirectives,
} from '../../packages/core-js-polyfill-provider/helpers/source-scan.js';
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

finish();
