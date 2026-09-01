// Unit tests for `helpers/pattern-matching.js` and `helpers/path-normalize.js`. Both are
// parser-agnostic pure string / data logic - heavily consumed by plugin-options validation
// and entry detection across babel-plugin + unplugin; regressions here surface as silent
// pattern matcher / import-id misnormalisation downstream
import { matchSelfDefaultTernarySlot } from '../../packages/core-js-polyfill-provider/resolve-node-type/value-ops.js';
import { entryToGlobalHint } from '../../packages/core-js-polyfill-provider/index.js';
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
  disableDirectiveAnchors,
  disableDirectiveKind,
  isNextLineDisableDirective,
  mergeVisitors,
  parseDisableDirectives,
} from '../../packages/core-js-polyfill-provider/helpers/source-scan.js';
import {
  classOwnThisMethodInfo,
  directiveValue,
  extractIndirectRequireSEPrefix,
  findFunctionScopeVarInPath,
  findObjectKeyBeforeSpread,
  findTSRuntimeBindingInPath,
  findVarOwnerDeclaring,
  forEachStatementPosition,
  importBindingView,
  isDirectiveStatement,
  isStatementPosition,
  programPrologueEndIndex,
  prologueEndIndex,
  isFunctionParamDestructureParent,
  isReusableReceiver,
  methodReadsUsageCensus,
  migratableClaimSe,
  nodeSpan,
  paramListReadsName,
  peelMemoizeWrappers,
  peelSequenceTail,
  peelZeroArgIifeReturn,
  privateNameSpelling,
  pureCtorNameFromImportSource,
  SINGLE_STATEMENT_SLOTS,
  SKIPPABLE_WRAPPER_TYPES,
  spreadAtOrBefore,
  staticMemberFromEntrySegment,
  TS_EXPR_WRAPPERS,
  unwrapRuntimeExpr,
  zeroArgIifeSideEffectFree,
  usableAliasInfo,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { tagError } from '../../packages/core-js-polyfill-provider/helpers/error-tag.js';
import { subsume } from '../../packages/core-js-polyfill-provider/helpers/subsumption.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, checkTruthy, finish, throwsWith } = createChecker('helpers');

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
  '`include[1]` must be a non-empty string');

// non-string non-regex item rejected
throwsWith('validatePatternList/number item rejected',
  () => validatePatternList('include', ['ok', 42]),
  '`include[1]` must be a string or RegExp');

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

// `core-js/configurator.js` sits next to the root index and is equally internal
check('isCoreJSFile/core-js configurator', isCoreJSFile('node_modules/core-js/configurator.js'), true);

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
  function fn() { return 'kept'; }
  const merged = mergeVisitors({ Foo: fn }, { Foo: null });
  check('mergeVisitors/null in extra preserves base', merged.Foo, fn);
}
{
  function fn() { return 'kept'; }
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

// `core-js-disable-next-line` over a MULTI-LINE statement covers the statement's whole span, and
// the depth it sits at is the source's: the retired 64-node budget truncated the scan at ~16
// levels of nested callbacks and the opt-out was silently revoked from there down. build the
// target statement under `depth` block levels and assert the span at a depth on each side
{
  function directiveLines(depth) {
    // the directive sits on line `depth`, so the statement it covers opens on the next one
    const targetLine = depth + 1;
    let statement = {
      type: 'ExpressionStatement',
      loc: { start: { line: targetLine }, end: { line: targetLine + 2 } },
    };
    for (let i = depth; i > 0; i--) {
      statement = {
        type: 'BlockStatement',
        body: [statement],
        loc: { start: { line: i }, end: { line: targetLine + 2 + (depth - i) } },
      };
    }
    return parseDisableDirectives({
      comments: [{ value: 'core-js-disable-next-line', loc: { start: { line: depth }, end: { line: depth } } }],
      ast: { type: 'Program', body: [statement], loc: { start: { line: 1 }, end: { line: 400 } } },
    });
  }
  for (const depth of [8, 80]) {
    const result = directiveLines(depth);
    checkTruthy(`parseDisableDirectives/multi-line span at depth ${ depth } covers statement start`,
      result instanceof Set && result.has(depth + 1));
    checkTruthy(`parseDisableDirectives/multi-line span at depth ${ depth } covers statement end`,
      result instanceof Set && result.has(depth + 3));
  }
}

// a whitespace JSXText run between two children opens on the covered line and ends on the next: it is
// text, not a host, so the directive stops at the covered line and the child below stays live
{
  function child(line) {
    return { type: 'JSXExpressionContainer', loc: { start: { line }, end: { line } } };
  }
  const element = {
    type: 'JSXElement',
    loc: { start: { line: 2 }, end: { line: 5 } },
    children: [child(3), { type: 'JSXText', loc: { start: { line: 3 }, end: { line: 4 } } }, child(4)],
  };
  const statement = { type: 'ExpressionStatement', expression: element, loc: { start: { line: 2 }, end: { line: 5 } } };
  const result = parseDisableDirectives({
    comments: [{ value: 'core-js-disable-next-line', loc: { start: { line: 2 }, end: { line: 2 } } }],
    ast: { type: 'Program', body: [statement], loc: { start: { line: 1 }, end: { line: 5 } } },
  });
  checkTruthy('parseDisableDirectives/JSX text run does not span the directive onto the next child',
    result instanceof Set && result.has(3) && !result.has(4));
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

// --- isStatementPosition ---

// a statement position is a statement list's member or an un-braced control body; a loop head's
// declaration and an export's declaration are statement-shaped nodes in slots that are not
{
  const declaration = { type: 'VariableDeclaration', declarations: [] };
  const statement = { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'x' } };
  check('isStatementPosition/statement list member', isStatementPosition(declaration, { type: 'Program', body: [declaration] }), true);
  check('isStatementPosition/block member', isStatementPosition(statement, { type: 'BlockStatement', body: [statement] }), true);
  check('isStatementPosition/switch case consequent', isStatementPosition(statement, { type: 'SwitchCase', consequent: [statement] }), true);
  check('isStatementPosition/un-braced if body', isStatementPosition(statement, { type: 'IfStatement', consequent: statement, alternate: null }), true);
  check('isStatementPosition/loop head declaration', isStatementPosition(declaration, { type: 'ForOfStatement', left: declaration, body: statement }), false);
  check('isStatementPosition/export declaration', isStatementPosition(declaration, { type: 'ExportNamedDeclaration', declaration }), false);
  check('isStatementPosition/a sibling, not the node', isStatementPosition(declaration, { type: 'Program', body: [statement] }), false);
  check('isStatementPosition/no parent', isStatementPosition(declaration, null), false);
}

// --- disableDirectiveKind / isNextLineDisableDirective ---

check('disableDirectiveKind/file', disableDirectiveKind(' core-js-disable-file'), 'file');
check('disableDirectiveKind/line', disableDirectiveKind(' core-js-disable-line'), 'line');
check('disableDirectiveKind/next-line with a reason', disableDirectiveKind(' core-js-disable-next-line -- reason'), 'next-line');
check('disableDirectiveKind/plain comment', disableDirectiveKind(' plain note'), null);
check('isNextLineDisableDirective/line spelling is not', isNextLineDisableDirective(' core-js-disable-line'), false);
check('isNextLineDisableDirective/JSDoc continuation', isNextLineDisableDirective('*\n * core-js-disable-next-line\n '), true);

// --- disableDirectiveAnchors ---

// babel-shaped locs: `at` stamps a node with its line span, `read` builds a one-read statement
{
  function at(node, line, endLine = line) {
    return { ...node, loc: { start: { line }, end: { line: endLine } } };
  }
  function id(name, line) {
    return at({ type: 'Identifier', name }, line);
  }
  function read(line, endLine = line) {
    return at({ type: 'ExpressionStatement', expression: id('x', line) }, line, endLine);
  }
  function program(body, endLine) {
    return at({ type: 'Program', body }, 1, endLine);
  }
  function notLed() {
    return false;
  }
  function same(anchors, expected) {
    return anchors.length === expected.length && anchors.every((node, i) => node === expected[i]);
  }
  function anchorsOf(body, lines, { endLine = 10, isLed = notLed, settled = null } = {}) {
    return disableDirectiveAnchors({ ast: program(body, endLine), disabledLines: new Set(lines), isLed, settled });
  }

  // two statements sharing the covered line: the led one keeps its directive, the other takes an anchor
  {
    const first = read(2);
    const second = read(2);
    const anchors = anchorsOf([first, second, read(3)], [2], { isLed: node => node === first });
    checkTruthy('disableDirectiveAnchors/the unled sibling on the covered line anchors', same(anchors, [second]));
  }
  // a covered host is one anchor: nothing under it is looked at
  {
    const block = at({ type: 'BlockStatement', body: [read(3), read(4)] }, 2, 5);
    const host = at({ type: 'IfStatement', test: id('c', 2), consequent: block }, 2, 5);
    checkTruthy('disableDirectiveAnchors/a covered host prunes its body', same(anchorsOf([host], [2, 3, 4, 5]), [host]));
  }
  // a covered line inside an uncovered statement is reached through it
  {
    const inner = [read(4), read(4)];
    const fn = at({ type: 'FunctionExpression', params: [], body: at({ type: 'BlockStatement', body: inner }, 2, 5) }, 2, 5);
    const callNode = at({ type: 'CallExpression', callee: id('f', 2), arguments: [fn] }, 2, 5);
    const outer = at({ type: 'ExpressionStatement', expression: callNode }, 2, 5);
    checkTruthy('disableDirectiveAnchors/nested covered siblings anchor themselves', same(anchorsOf([outer], [4]), inner));
  }
  // a covered node in a position the printers share a line on hands the anchor to its statement
  {
    const callNode = at({ type: 'CallExpression', callee: id('f', 2), arguments: [id('a', 3), id('b', 3)] }, 2, 3);
    const outer = at({ type: 'ExpressionStatement', expression: callNode }, 2, 3);
    checkTruthy('disableDirectiveAnchors/arguments hoist to their statement, once', same(anchorsOf([outer], [3]), [outer]));
  }
  // object and pattern properties and class members are their own anchors
  {
    function member(name, line) {
      return at({ type: 'ObjectProperty', key: id(name, line) }, line);
    }
    function declare(target, init, line, endLine) {
      const declarator = at({ type: 'VariableDeclarator', id: target, init }, line, endLine);
      return at({ type: 'VariableDeclaration', declarations: [declarator] }, line, endLine);
    }
    const props = [member('k', 3), member('j', 3)];
    const decl = declare(id('o', 2), at({ type: 'ObjectExpression', properties: props }, 2, 4), 2, 4);
    const members = [at({ type: 'ClassMethod', key: id('m', 6) }, 6), at({ type: 'ClassMethod', key: id('n', 6) }, 6)];
    const klass = at({ type: 'ClassDeclaration', id: id('A', 5), body: at({ type: 'ClassBody', body: members }, 5, 7) }, 5, 7);
    const patternProps = [member('at', 9), member('flat', 9)];
    const pattern = declare(at({ type: 'ObjectPattern', properties: patternProps }, 8, 10), id('arr', 10), 8, 10);
    const anchors = anchorsOf([decl, klass, pattern], [3, 6, 9]);
    checkTruthy('disableDirectiveAnchors/properties and members anchor themselves', same(anchors, [...props, ...members, ...patternProps]));
  }
  // a switch case is printed inline by its switch on one leg, so it hands the anchor to the switch
  {
    const kase = at({ type: 'SwitchCase', test: at({ type: 'NumericLiteral', value: 1 }, 3), consequent: [read(3)] }, 3);
    const sw = at({ type: 'SwitchStatement', discriminant: id('x', 2), cases: [kase] }, 2, 4);
    checkTruthy('disableDirectiveAnchors/a switch case hoists to its switch', same(anchorsOf([sw], [3]), [sw]));
  }
  // an unbraced body is a statement position of its own
  {
    const body = read(3);
    const host = at({ type: 'IfStatement', test: id('c', 2), consequent: body }, 2, 3);
    checkTruthy('disableDirectiveAnchors/an unbraced body anchors itself', same(anchorsOf([host], [3]), [body]));
  }
  // a JSX child and a template quasi are text: both hand the anchor up to the statement
  {
    const child = at({ type: 'JSXExpressionContainer', expression: id('x', 3) }, 3);
    const jsx = at({ type: 'ExpressionStatement', expression: at({ type: 'JSXElement', children: [child] }, 2, 4) }, 2, 4);
    const quasis = [at({ type: 'TemplateElement', value: { raw: '' } }, 5), at({ type: 'TemplateElement', value: { raw: 'text' } }, 6)];
    const literal = at({ type: 'TemplateLiteral', quasis, expressions: [id('y', 6)] }, 5, 6);
    const template = at({ type: 'ExpressionStatement', expression: literal }, 5, 6);
    const anchors = anchorsOf([jsx, template], [3, 6]);
    checkTruthy('disableDirectiveAnchors/JSX children and template parts hoist to the statement', same(anchors, [jsx, template]));
  }
  // a settled node is pruned whole; a comment hung on a node is never a candidate; Program never anchors
  {
    const settledRead = read(2, 3);
    const plain = read(1);
    plain.leadingComments = [at({ type: 'CommentLine', value: ' core-js-disable-line' }, 4)];
    const anchors = anchorsOf([plain, settledRead], [1, 2, 3, 4], { endLine: 4, settled: new Set([settledRead]) });
    checkTruthy('disableDirectiveAnchors/settled pruned, comments skipped, Program excluded', same(anchors, [plain]));
  }
  // a synthesized wrapper without a position is looked through
  {
    const inner = read(2);
    checkTruthy('disableDirectiveAnchors/a positionless wrapper is looked through',
      same(anchorsOf([{ type: 'BlockStatement', body: [inner] }], [2]), [inner]));
  }
  // the oxc dialect: offsets plus the line mapper
  {
    const code = 'a(); b();\nc();\n';
    function span(type, start, end, extra = {}) {
      return { type, start, end, ...extra };
    }
    function expressionAt(start, end) {
      return span('ExpressionStatement', start, end, { expression: span('Identifier', start, end - 3, { name: 'x' }) });
    }
    const first = expressionAt(0, 4);
    const second = expressionAt(5, 9);
    const ast = span('Program', 0, code.length, { body: [first, second, expressionAt(10, 14)] });
    const anchors = disableDirectiveAnchors({
      ast, disabledLines: new Set([1]), offsetToLine: buildOffsetToLine(code), isLed: node => node === first,
    });
    checkTruthy('disableDirectiveAnchors/oxc offsets resolve through the line mapper', same(anchors, [second]));
  }
  check('disableDirectiveAnchors/no directive set means no anchors', anchorsOf([read(1)], [], { isLed: notLed }).length, 0);
  check('disableDirectiveAnchors/a null directive set means no anchors',
    disableDirectiveAnchors({ ast: program([read(1)], 1), disabledLines: null, isLed: notLed }).length, 0);
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

// --- peelSequenceTail ---

// the single spelling of the comma-sequence descent. no source produces a cyclic AST, so these
// assertions are the only oracle the guard has - the corpus cannot fail on it
{
  function id(name) {
    return { type: 'Identifier', name };
  }
  function commaSeq(...expressions) {
    return { type: 'SequenceExpression', expressions };
  }

  check('peelSequenceTail/non-sequence is identity', peelSequenceTail(id('X'))?.name, 'X');
  check('peelSequenceTail/flat tail', peelSequenceTail(commaSeq(id('a'), id('X')))?.name, 'X');
  check('peelSequenceTail/nested tail', peelSequenceTail(commaSeq(id('a'), commaSeq(id('b'), id('X'))))?.name, 'X');

  // `step` runs on each tail - a wrapper between hops peels only through it
  const wrapped = commaSeq(id('a'), { type: 'ParenthesizedExpression', expression: commaSeq(id('b'), id('X')) });
  check('peelSequenceTail/without step a wrapper stops the descent',
    peelSequenceTail(wrapped)?.type, 'ParenthesizedExpression');
  check('peelSequenceTail/step peels between hops',
    peelSequenceTail(wrapped, { step: unwrapRuntimeExpr })?.name, 'X');

  // `onPrefix` sees every hop's full expression list
  {
    const seen = [];
    peelSequenceTail(commaSeq(id('a'), commaSeq(id('b'), id('X'))), {
      onPrefix: expressions => { seen.push(expressions.length); },
    });
    checkDeep('peelSequenceTail/onPrefix sees each hop', seen, [2, 2]);
  }

  // returning false from `onPrefix` REFUSES the hop: the descent stops on that node, which is how
  // a caller that must not step through an effectful prefix reports it
  check('peelSequenceTail/onPrefix false stops on the node',
    peelSequenceTail(commaSeq(id('a'), id('X')), { onPrefix: () => false })?.type, 'SequenceExpression');

  // a self-referential tail terminates instead of spinning; an empty list is not stepped into
  {
    const cyclic = commaSeq(id('a'));
    cyclic.expressions.push(cyclic);
    check('peelSequenceTail/cyclic tail terminates', peelSequenceTail(cyclic)?.type, 'SequenceExpression');
    check('peelSequenceTail/empty sequence is not stepped into', peelSequenceTail(commaSeq())?.type, 'SequenceExpression');
  }

  // a caller alternating its own loop with this one guards the whole alternation by sharing `visited`
  {
    const visited = new Set();
    const tail = id('X');
    const outer = commaSeq(id('a'), tail);
    check('peelSequenceTail/shared visited first pass', peelSequenceTail(outer, { visited })?.name, 'X');
    check('peelSequenceTail/shared visited refuses a re-descent to the same tail',
      peelSequenceTail(outer, { visited })?.type, 'SequenceExpression');
  }
}

// --- the sequence descent's REFUSING consumers ---

// a zero-arg IIFE reached through a comma-sequence callee: the descent must refuse an effectful
// prefix at ANY level, not only the outermost, and still reach the arrow through pure ones. the
// domain is enumerated element-wise because a single-level check answers three of these five wrong
{
  function id(name) {
    return { type: 'Identifier', name };
  }
  function commaSeq(...expressions) {
    return { type: 'SequenceExpression', expressions };
  }
  function iife(callee) {
    return { type: 'CallExpression', callee, arguments: [], optional: false };
  }
  function arrow(body) {
    return { type: 'ArrowFunctionExpression', params: [], body, async: false, generator: false };
  }
  function effect() {
    return { type: 'CallExpression', callee: id('sideEffect'), arguments: [], optional: false };
  }

  const fn = arrow(id('X'));
  const nestedEffectful = commaSeq(id('pure'), commaSeq(effect(), fn));
  for (const [label, node, expected] of [
    ['bare callee', iife(fn), true],
    ['pure prefix', iife(commaSeq(id('pure'), fn)), true],
    ['effectful prefix', iife(commaSeq(effect(), fn)), false],
    ['pure outside, effectful inside', iife(nestedEffectful), false],
    ['pure at both levels', iife(commaSeq(id('a'), commaSeq(id('b'), fn))), true],
  ]) {
    check(`zeroArgIifeSideEffectFree/${ label }`, zeroArgIifeSideEffectFree(node), expected);
  }
  // the RETURN peel reaches the same arrow through either nesting - refusal is the effect gate's
  // job, not the peel's
  check('peelZeroArgIifeReturn/through a flat sequence callee',
    peelZeroArgIifeReturn(iife(commaSeq(id('p'), fn)))?.name, 'X');
  const nestedPure = commaSeq(id('p'), commaSeq(id('q'), fn));
  check('peelZeroArgIifeReturn/through a nested sequence callee',
    peelZeroArgIifeReturn(iife(nestedPure))?.name, 'X');
}

// --- isFunctionParamDestructureParent ---

// minimal path-like shape: `.node` + `.parentPath`. parser-agnostic helper exposed in
// `ast-patterns.js`; the shared ancestor climb ends on the tree and on a cycle, never on a hop
// budget, so synthetic paths exercise both terminations without needing a real parser run
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

// nesting past the retired 32-hop budget is answered by the TREE, both ways: a 40-deep chain
// owned by a function is a param destructure, the same chain owned by a declarator is not. the
// budget used to throw `pattern nesting exceeds 32 levels` on both - a build abort on legal source
{
  function nestedPatternPath(depth, ownerNode) {
    const innerOP = { type: 'ObjectPattern', properties: [] };
    const innerPath = { node: innerOP, parentPath: null };
    let currentPath = innerPath;
    let prevNode = innerOP;
    for (let i = 0; i < depth; i++) {
      const wrapperNode = { type: 'ObjectPattern', properties: [prevNode] };
      currentPath.parentPath = { node: wrapperNode, parentPath: null };
      currentPath = currentPath.parentPath;
      prevNode = wrapperNode;
    }
    if (ownerNode) currentPath.parentPath = { node: { ...ownerNode, params: [prevNode] }, parentPath: null };
    return innerPath;
  }
  check('isFunctionParamDestructureParent/40-deep param nest resolves',
    isFunctionParamDestructureParent(nestedPatternPath(40, { type: 'FunctionDeclaration' })), true);
  check('isFunctionParamDestructureParent/40-deep non-param nest still false',
    isFunctionParamDestructureParent(nestedPatternPath(40, null)), false);
}

// a CYCLIC parent chain - the case the retired budget nominally defended - terminates on the
// visited set and answers with the helper's own bail, not a throw and not a hang
{
  const objectPattern = { type: 'ObjectPattern', properties: [] };
  const wrapperNode = { type: 'ObjectPattern', properties: [objectPattern] };
  const path = { node: objectPattern, parentPath: null };
  const wrapperPath = { node: wrapperNode, parentPath: null };
  path.parentPath = wrapperPath;
  wrapperPath.parentPath = path;
  wrapperNode.properties.push(wrapperNode);
  check('isFunctionParamDestructureParent/cyclic parent chain bails', isFunctionParamDestructureParent(path), false);
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
  function id(name) { return { type: 'Identifier', name }; }
  const ofBinding = { type: 'ObjectProperty', key: id('of'), value: id('of'), computed: false, shorthand: true };
  const restEl = { type: 'RestElement', argument: id('rest') };
  function dflt(name, right) {
    return {
      type: 'ObjectProperty', key: id(name), computed: false,
      value: { type: 'AssignmentPattern', left: id(name), right },
    };
  }

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
// an empty-string directive IS part of the prologue per the spec (any string-literal statement
// extends it) - rejecting it stopped the prologue scan ahead of a following 'use strict'
check('isDirectiveStatement/empty stmt marker', isDirectiveStatement({ type: 'ExpressionStatement', directive: '' }), true);
check('isDirectiveStatement/empty inner marker',
  isDirectiveStatement({ type: 'ExpressionStatement', expression: { type: 'Literal', value: '', directive: '' } }), true);
// a bare non-directive string-literal statement must NOT qualify (would wrongly extend the import region)
check('isDirectiveStatement/non-directive string',
  isDirectiveStatement({ type: 'ExpressionStatement', expression: { type: 'Literal', value: 'foo' } }), false);
check('isDirectiveStatement/non-expression-statement', isDirectiveStatement({ type: 'ReturnStatement' }), false);
check('isDirectiveStatement/nullish', isDirectiveStatement(null), false);

// --- directiveValue (shared extractor: both shapes feed the `=== 'use strict'` reads) ---
// statement marker shape (oxc / babel real directives)
check('directiveValue/stmt marker', directiveValue({ type: 'ExpressionStatement', directive: 'use strict' }), 'use strict');
// inner-literal marker shape (sibling-plugin synth re-emit) - the value the statement-only read missed
check('directiveValue/inner-literal marker',
  directiveValue({ type: 'ExpressionStatement', expression: { type: 'Literal', value: 'use strict', directive: 'use strict' } }), 'use strict');
// statement marker wins when both present
check('directiveValue/stmt marker preferred over inner',
  directiveValue({ directive: 'use asm', expression: { directive: 'use strict' } }), 'use asm');
// empty-string directive is a real (prologue-extending) value, NOT null
check('directiveValue/empty stmt marker', directiveValue({ directive: '' }), '');
// a non-directive node yields null so `=== 'use strict'` is cleanly false
check('directiveValue/non-directive', directiveValue({ type: 'ExpressionStatement', expression: { type: 'Literal', value: 'foo' } }), null);
check('directiveValue/nullish', directiveValue(null), null);

// --- the prologue-end pair: marker-based for ANY body, marker-less-tolerant for the PROGRAM ---

// `prologueEndIndex` answers for a block that admits no prologue at all (a class static block),
// so it must never promote a marker-less string; the program half must, or a head insertion
// lands above a re-emitted `'use client'` and silently disables it
function markedDirective(directive) {
  return { type: 'ExpressionStatement', directive, expression: { type: 'Literal', value: directive, directive } };
}
function bareDirective(value) {
  return { type: 'ExpressionStatement', expression: { type: 'Literal', value } };
}
const realCode = { type: 'ExpressionStatement', expression: { type: 'CallExpression' } };

for (const [name, end] of [['prologueEndIndex', prologueEndIndex], ['programPrologueEndIndex', programPrologueEndIndex]]) {
  check(`${ name }/empty body`, end([]), 0);
  check(`${ name }/nullish body`, end(null), 0);
  check(`${ name }/no prologue`, end([realCode, markedDirective('use strict')]), 0);
  check(`${ name }/one marked directive`, end([markedDirective('use strict'), realCode]), 1);
  check(`${ name }/consecutive marked directives`,
    end([markedDirective('use strict'), markedDirective('use asm'), realCode]), 2);
  check(`${ name }/a marked directive past code does not extend`,
    end([markedDirective('use strict'), realCode, markedDirective('use asm')]), 1);
  check(`${ name }/whole body is prologue`, end([markedDirective('use strict')]), 1);
}

check('prologueEndIndex/marker-less known directive is NOT prologue',
  prologueEndIndex([bareDirective('use client'), realCode]), 0);
check('programPrologueEndIndex/marker-less known directive IS prologue',
  programPrologueEndIndex([bareDirective('use client'), realCode]), 1);
check('programPrologueEndIndex/marker-less UNKNOWN string is not',
  programPrologueEndIndex([bareDirective('not-a-directive'), realCode]), 0);
check('programPrologueEndIndex/marker-less known value after a marked one',
  programPrologueEndIndex([markedDirective('use strict'), bareDirective('use server'), realCode]), 2);
check('programPrologueEndIndex/an unknown string stops the scan at itself',
  programPrologueEndIndex([markedDirective('use strict'), bareDirective('nope'), bareDirective('use client')]), 1);

// --- findTSRuntimeBindingInPath: a parameter property binds the body, never the decorators ---
// The two arms of this climb have DIFFERENT reach and the difference is the whole point: a TS
// runtime declaration (enum / namespace / import-equals) shadows the statement's entire subtree,
// including a decorator inside it, while a parameter property only reaches the parameter list and
// the body - a decorator hanging off that same list is evaluated where the class is defined, so
// the name there is still the global. Synthetic node-only paths, so one chain covers both dialects
{
  function buildConstructorPath({ probeIn, statement = null }) {
    const decoratorArg = { type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] };
    const decorator = { type: 'Decorator', expression: decoratorArg };
    const parameter = {
      type: 'TSParameterProperty',
      decorators: [decorator],
      parameter: { type: 'Identifier', name: 'Map' },
    };
    const bodyRead = { type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] };
    const bodyStmt = { type: 'ExpressionStatement', expression: bodyRead };
    const ctor = {
      type: 'FunctionExpression',
      params: [parameter],
      body: { type: 'BlockStatement', body: [bodyStmt] },
    };
    const program = { type: 'Program', sourceType: 'module', body: statement ? [statement, ctor] : [ctor] };
    const programPath = { node: program, parentPath: null };
    const ctorPath = { node: ctor, key: statement ? 1 : 0, listKey: 'body', parentPath: programPath };
    if (probeIn === 'body') {
      const stmtPath = { node: bodyStmt, key: 0, listKey: 'body', parentPath: { node: ctor.body, key: 'body', listKey: null, parentPath: ctorPath } };
      return { node: bodyRead, key: 'expression', listKey: null, parentPath: stmtPath };
    }
    const paramPath = { node: parameter, key: 0, listKey: 'params', parentPath: ctorPath };
    const decoratorPath = { node: decorator, key: 0, listKey: 'decorators', parentPath: paramPath };
    return { node: decoratorArg, key: 'expression', listKey: null, parentPath: decoratorPath };
  }
  const enumStatement = {
    type: 'TSEnumDeclaration',
    id: { type: 'Identifier', name: 'Map' },
    members: [],
  };
  checkTruthy('findTSRuntimeBindingInPath/parameter property reaches the constructor body',
    findTSRuntimeBindingInPath(buildConstructorPath({ probeIn: 'body' }), 'Map'));
  check('findTSRuntimeBindingInPath/parameter property does not reach its own decorator',
    findTSRuntimeBindingInPath(buildConstructorPath({ probeIn: 'decorator' }), 'Map'), false);
  // the other arm keeps its wider reach - the decorator really does sit inside the enum's scope
  checkTruthy('findTSRuntimeBindingInPath/enum declaration reaches the decorator',
    findTSRuntimeBindingInPath(buildConstructorPath({ probeIn: 'decorator', statement: enumStatement }), 'Map'));
  // an unrelated name is unaffected from either position
  check('findTSRuntimeBindingInPath/unshadowed name from the body',
    findTSRuntimeBindingInPath(buildConstructorPath({ probeIn: 'body' }), 'Set'), false);
  check('findTSRuntimeBindingInPath/unshadowed name from the decorator',
    findTSRuntimeBindingInPath(buildConstructorPath({ probeIn: 'decorator' }), 'Set'), false);
}

// --- nodeHasUseStrict directive-shape coverage (end-to-end via findFunctionScopeVarInPath) ---
// a sloppy-mode block-nested `function Foo(){}` Annex-B-hoists to the function scope and shadows the
// outer name, so usage-pure must NOT substitute. a `'use strict'` on the enclosing function block-
// scopes the declaration -> no shadow -> the global resolves. the strict signal must be read from
// BOTH the statement marker and the inner-literal marker (sibling-plugin synth shape) - else strict is
// mis-classified sloppy and the shadow gate falsely fires. synthetic node-only paths (no parser run)
{
  function buildSloppyShadowPath(directiveStmt) {
    const fooFn = { type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'Foo' }, params: [], body: { type: 'BlockStatement', body: [] } };
    const ifBlock = { type: 'IfStatement', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'BlockStatement', body: [fooFn] }, alternate: null };
    const usageNode = { type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] };
    const usageStmt = { type: 'ExpressionStatement', expression: usageNode };
    const body = directiveStmt ? [directiveStmt, ifBlock, usageStmt] : [ifBlock, usageStmt];
    const fnDecl = { type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'outer' }, params: [], body: { type: 'BlockStatement', body } };
    const program = { type: 'Program', sourceType: 'script', body: [fnDecl] };
    const fnPath = { node: fnDecl, parentPath: { node: program, parentPath: null } };
    return { node: usageNode, parentPath: { node: usageStmt, parentPath: fnPath } };
  }
  // statement marker (oxc / babel real directive) vs inner-literal marker (sibling-plugin synth shape)
  const stmtMarker = { type: 'ExpressionStatement', directive: 'use strict', expression: { type: 'Literal', value: 'use strict' } };
  const innerMarker = { type: 'ExpressionStatement', expression: { type: 'Literal', value: 'use strict', directive: 'use strict' } };
  // sloppy (no directive): the Annex-B block-function shadow is detected
  checkTruthy('findFunctionScopeVarInPath/sloppy block-fn shadow detected',
    findFunctionScopeVarInPath(buildSloppyShadowPath(null), 'Foo'));
  // strict via statement marker: shadow block-scoped, gate stays silent
  check('findFunctionScopeVarInPath/strict stmt-marker suppresses shadow',
    findFunctionScopeVarInPath(buildSloppyShadowPath(stmtMarker), 'Foo'), false);
  // strict via inner-literal marker: same suppression
  check('findFunctionScopeVarInPath/strict inner-literal suppresses shadow',
    findFunctionScopeVarInPath(buildSloppyShadowPath(innerMarker), 'Foo'), false);
}

// --- extractIndirectRequireSEPrefix ---

function call(name) {
  return { type: 'CallExpression', callee: { type: 'Identifier', name }, arguments: [] };
}
function seq(...expressions) {
  return { type: 'SequenceExpression', expressions };
}

function requireStmt(callType) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: callType,
      callee: seq(call('spy'), { type: 'Identifier', name: 'require' }),
      arguments: [{ type: 'StringLiteral', value: 'core-js/promise' }],
    },
  };
}
// non-optional indirect require keeps the callee-sequence side-effect prefix
check('extractIndirectRequireSEPrefix/plain call recovers prefix',
  extractIndirectRequireSEPrefix(requireStmt('CallExpression')).length, 1);
// babel models `(spy(), require)?.('core-js/...')` as OptionalCallExpression - same recovery
check('extractIndirectRequireSEPrefix/optional call recovers prefix',
  extractIndirectRequireSEPrefix(requireStmt('OptionalCallExpression')).length, 1);
// a side-effect-free callee prefix yields no recovered slots on either call shape
check('extractIndirectRequireSEPrefix/optional call no SE prefix',
  extractIndirectRequireSEPrefix({
    type: 'ExpressionStatement',
    expression: {
      type: 'OptionalCallExpression',
      callee: seq({ type: 'NumericLiteral', value: 0 }, { type: 'Identifier', name: 'require' }),
      arguments: [{ type: 'StringLiteral', value: 'core-js/promise' }],
    },
  }).length, 0);

// --- peelMemoizeWrappers: peel parens / chain ONLY (TS wrappers kept) - shared memo peel ---
{
  const inner = { type: 'Identifier', name: 'z' };
  check('peelMemoizeWrappers/ParenthesizedExpression peeled',
    peelMemoizeWrappers({ type: 'ParenthesizedExpression', expression: inner }), inner);
  check('peelMemoizeWrappers/ChainExpression peeled',
    peelMemoizeWrappers({ type: 'ChainExpression', expression: inner }), inner);
  check('peelMemoizeWrappers/nested wrappers peeled',
    peelMemoizeWrappers({ type: 'ChainExpression', expression: { type: 'ParenthesizedExpression', expression: inner } }), inner);
  // TS wrappers deliberately NOT peeled - keeps both emitters' memo decision aligned
  const tsWrap = { type: 'TSAsExpression', expression: inner };
  check('peelMemoizeWrappers/TSAsExpression NOT peeled', peelMemoizeWrappers(tsWrap), tsWrap);
  check('peelMemoizeWrappers/null safe', peelMemoizeWrappers(null), null);
}

// --- unwrapRuntimeExpr: peels the WHOLE skippable set, and the memo peel is its TS-less subset ---
// enumerated over the set itself rather than over sampled types: a member added to
// SKIPPABLE_WRAPPER_TYPES without a matching peel would otherwise pass unnoticed, and the pair of
// loops is what keeps the two peels from silently converging onto one behavior
{
  const inner = { type: 'Identifier', name: 'z' };
  for (const type of SKIPPABLE_WRAPPER_TYPES) {
    check(`unwrapRuntimeExpr/${ type } peeled`, unwrapRuntimeExpr({ type, expression: inner }), inner);
    // the memo peel keeps exactly the TS members and drops the rest
    const wrapped = { type, expression: inner };
    check(`peelMemoizeWrappers/${ type } ${ TS_EXPR_WRAPPERS.has(type) ? 'kept' : 'peeled' }`,
      peelMemoizeWrappers(wrapped), TS_EXPR_WRAPPERS.has(type) ? wrapped : inner);
  }
  check('unwrapRuntimeExpr/nested mixed wrappers peeled', unwrapRuntimeExpr({
    type: 'ChainExpression',
    expression: { type: 'TSAsExpression', expression: { type: 'ParenthesizedExpression', expression: inner } },
  }), inner);
  const bare = { type: 'CallExpression' };
  check('unwrapRuntimeExpr/non-wrapper returned as is', unwrapRuntimeExpr(bare), bare);
  check('unwrapRuntimeExpr/null safe', unwrapRuntimeExpr(null), null);
}

// --- isReusableReceiver: peeled node is a bare Identifier or `this` (no memo `_ref` needed) ---
check('isReusableReceiver/Identifier', isReusableReceiver({ type: 'Identifier', name: 'x' }), true);
check('isReusableReceiver/ThisExpression', isReusableReceiver({ type: 'ThisExpression' }), true);
check('isReusableReceiver/CallExpression', isReusableReceiver({ type: 'CallExpression' }), false);
check('isReusableReceiver/MemberExpression', isReusableReceiver({ type: 'MemberExpression' }), false);
check('isReusableReceiver/parenthesized Identifier',
  isReusableReceiver({ type: 'ParenthesizedExpression', expression: { type: 'Identifier', name: 'x' } }), true);
check('isReusableReceiver/chain-wrapped this',
  isReusableReceiver({ type: 'ChainExpression', expression: { type: 'ThisExpression' } }), true);
// TS wrapper is NOT peeled, so a TS-wrapped Identifier still needs a memo ref
check('isReusableReceiver/TS-wrapped Identifier needs ref',
  isReusableReceiver({ type: 'TSAsExpression', expression: { type: 'Identifier', name: 'x' } }), false);
check('isReusableReceiver/null safe', isReusableReceiver(null), false);

// --- canonical spread guards (all positional / object-key spread-bail sites delegate here) ---
// spreadAtOrBefore: a spread AT or BEFORE the index shifts later positions -> true; accepts paths or nodes
const SP = { type: 'SpreadElement' };
function EL(name) { return { type: 'Identifier', name }; }
check('spreadAtOrBefore/spread at index', spreadAtOrBefore([SP, EL('b')], 0), true);
check('spreadAtOrBefore/spread before index', spreadAtOrBefore([SP, EL('b'), EL('c')], 2), true);
check('spreadAtOrBefore/spread after index', spreadAtOrBefore([EL('a'), EL('b'), SP], 1), false);
check('spreadAtOrBefore/no spread', spreadAtOrBefore([EL('a'), EL('b')], 1), false);
check('spreadAtOrBefore/path form (.node)', spreadAtOrBefore([{ node: SP }, { node: EL('b') }], 1), true);
check('spreadAtOrBefore/empty + null safe', spreadAtOrBefore([], 3) || spreadAtOrBefore(null, 0), false);

// findObjectKeyBeforeSpread: last matching data property, or null if a spread sits AFTER the match
function prop(key, tag) { return { type: 'Property', key, tag }; }
function matchA(p) { return p.key === 'a'; }
check('findObjectKeyBeforeSpread/trailing spread bails',
  findObjectKeyBeforeSpread([prop('a', 1), SP], matchA), null);
check('findObjectKeyBeforeSpread/leading spread keeps later match',
  findObjectKeyBeforeSpread([SP, prop('a', 2)], matchA)?.tag, 2);
check('findObjectKeyBeforeSpread/duplicate keys last-wins',
  findObjectKeyBeforeSpread([prop('a', 1), prop('a', 2)], matchA)?.tag, 2);
check('findObjectKeyBeforeSpread/match after a mid spread wins',
  findObjectKeyBeforeSpread([prop('a', 1), SP, prop('a', 2)], matchA)?.tag, 2);
check('findObjectKeyBeforeSpread/no match', findObjectKeyBeforeSpread([prop('b', 1)], matchA), null);

// `privateNameSpelling` is the single canon for the private-name `#name`: babel nests the id under
// `.id`, estree carries `.name` directly - both must spell identically, and a non-private node is null
check('privateNameSpelling/babel PrivateName', privateNameSpelling({ type: 'PrivateName', id: { name: 'x' } }), '#x');
check('privateNameSpelling/estree PrivateIdentifier', privateNameSpelling({ type: 'PrivateIdentifier', name: 'x' }), '#x');
check('privateNameSpelling/non-private is null', privateNameSpelling({ type: 'Identifier', name: 'x' }), null);
check('privateNameSpelling/nullish is null', privateNameSpelling(null), null);

// `classOwnThisMethodInfo` reads the RAW member type, so both parser spellings of an auto-accessor
// field must collect its initializer: babel emits ClassAccessorProperty, ESTree/oxc AccessorProperty.
// matching one only would silently drop the own-this method and leave a leak undetected on that parser
function accessorFieldClass(memberType) {
  const fn = { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } };
  return { type: 'ClassDeclaration', body: { type: 'ClassBody', body: [
    { type: memberType, static: false, computed: false, key: { type: 'Identifier', name: 'm' }, value: fn },
  ] } };
}
for (const spelling of ['ClassAccessorProperty', 'AccessorProperty']) {
  const info = classOwnThisMethodInfo(accessorFieldClass(spelling), false);
  check(`classOwnThisMethodInfo/${ spelling } collects the accessor-held method`,
    [...info?.methodKeys ?? []].join(','), 'm');
}

// --- forEachStatementPosition: the un-braced slot half ---
// the un-braced half of the statement lattice: slots that hold ONE statement instead of a list.
// a pass rewriting a statement into several has to brace these first, so the enumeration has to
// name every such slot, skip the braced ones (they belong to the statement-list walk, and visiting
// both would double-handle the same statement), and reach slots nested inside other statements

function stmt(tag) {
  return { type: 'ExpressionStatement', expression: { type: 'Identifier', name: tag } };
}
function slotsOf(root) {
  const seen = [];
  forEachStatementPosition(root, { onUnbracedSlot: (host, key) => seen.push(`${ host.type }.${ key }`) });
  return seen.sort().join(',');
}

// every declared host reports its slot when the slot holds a bare statement
for (const [type, keys] of SINGLE_STATEMENT_SLOTS) {
  const node = { type };
  for (const key of keys) node[key] = stmt(key);
  check(`forEachStatementPosition/${ type } reports its slots`,
    slotsOf(node), keys.map(key => `${ type }.${ key }`).sort().join(','));
}

// a braced body is a statement-list host, so it belongs to the other walk and must NOT be reported
check('forEachStatementPosition/braced body skipped',
  slotsOf({ type: 'ForStatement', body: { type: 'BlockStatement', body: [stmt('a')] } }), '');

// only one arm of an `if` braced - the bare arm still reports
check('forEachStatementPosition/mixed if arms',
  slotsOf({ type: 'IfStatement', consequent: { type: 'BlockStatement', body: [] }, alternate: stmt('b') }),
  'IfStatement.alternate');

// an absent slot (`if` with no else) reports nothing for it
check('forEachStatementPosition/absent alternate',
  slotsOf({ type: 'IfStatement', consequent: stmt('a'), alternate: null }), 'IfStatement.consequent');

// slots nested inside another statement are reached - the walk recurses structurally
check('forEachStatementPosition/nested slot reached',
  slotsOf({ type: 'WhileStatement', body: { type: 'ForStatement', body: stmt('a') } }),
  'ForStatement.body,WhileStatement.body');

// a node type outside the table never reports, whatever it holds at `body`
check('forEachStatementPosition/non-slot host ignored',
  slotsOf({ type: 'SwitchCase', consequent: [stmt('a')], body: stmt('b') }), '');

// --- findVarOwnerDeclaring: the var-scope declarator list ---
// the alias registry keys its entry under EVERY same-name `var` declarator of the owner, because a
// redeclaration merges into one runtime binding while the two scope trackers disagree about which
// declarator a read resolves to. so the canon must report all of them, in source order, INCLUDING
// the value-less `var M;` (it binds the same slot) and EXCLUDING both a tsc-elided `declare var`
// (no runtime slot at all) and a nested function's own `var` (a different scope)
{
  function varDeclaration(name, { init = null, declare = false } = {}) {
    return {
      type: 'VariableDeclaration', kind: 'var', declare: declare || undefined,
      declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name }, init }],
    };
  }
  const first = varDeclaration('M', { init: { type: 'Identifier', name: 'globalThis' } });
  const bare = varDeclaration('M');
  const ambient = varDeclaration('A', { declare: true });
  const nested = varDeclaration('M');
  const innerFn = {
    type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'inner' }, params: [],
    body: { type: 'BlockStatement', body: [nested] },
  };
  const usageStmt = { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'M' } };
  const program = { type: 'Program', sourceType: 'module', body: [first, bare, ambient, innerFn, usageStmt] };
  const programPath = { node: program, parentPath: null };
  const usagePath = { node: usageStmt, parentPath: programPath };

  const found = findVarOwnerDeclaring(usagePath, 'M');
  checkTruthy('findVarOwnerDeclaring/owner is the program', found?.owner.node === program);
  check('findVarOwnerDeclaring/declarator is the FIRST declaration',
    found?.declarator === first.declarations[0], true);
  check('findVarOwnerDeclaring/every same-name declarator, source order',
    found?.declarators.length, 2);
  check('findVarOwnerDeclaring/value-less redeclaration kept',
    found?.declarators[1] === bare.declarations[0], true);
  check('findVarOwnerDeclaring/nested function var excluded',
    found?.declarators.includes(nested.declarations[0]), false);
  // ambient: tsc erases it, so the reference resolves to the global and the name is not declared here
  check('findVarOwnerDeclaring/ambient declare var is not a declaration', findVarOwnerDeclaring(usagePath, 'A'), null);
}

// --- resolveImportPath: repeated resolution is stable ---
// the absolute form is served from a per-specifier memo, so a second ask must return the same
// string as the first (and the relative form must stay untouched by the memo entirely)
{
  const first = resolveImportPath('@core-js/pure', 'actual/array/from', true);
  check('resolveImportPath/absolute is stable across calls',
    resolveImportPath('@core-js/pure', 'actual/array/from', true), first);
  check('resolveImportPath/relative unaffected',
    resolveImportPath('@core-js/pure', 'actual/array/from', false), '@core-js/pure/actual/array/from');
}

// --- methodReadsUsageCensus: the census gate both emitters read ---
// enumerated over the WHOLE method domain, not a range: the predicate decides whether a file pays
// the per-file census walk and the name reservation it feeds, so a method silently falling on the
// wrong side either costs every file a dead walk or drops a reservation a minted name needs
check('methodReadsUsageCensus/usage-global reads it', methodReadsUsageCensus('usage-global'), true);
check('methodReadsUsageCensus/usage-pure reads it', methodReadsUsageCensus('usage-pure'), true);
check('methodReadsUsageCensus/entry-global does not', methodReadsUsageCensus('entry-global'), false);

// --- subsume: the rescue-list contract and the closed form domain ---
// the rescue list is what an emit re-emits verbatim; "nothing to re-emit" reaches this canon spelled
// three ways (omitted / undefined / null), and all three must mean the same empty set rather than a
// crash inside the shared helper. the form domain is enumerated MEMBER BY MEMBER: an unrecognised
// form used to answer "consumed nothing", which is precisely the answer that strands a rewrite
{
  function walkNode(root, visit) {
    visit(root);
    for (const key of ['object', 'property', 'left', 'right']) if (root[key]) walkNode(root[key], visit);
  }
  function region() {
    return {
      type: 'MemberExpression', start: 0, end: 10, computed: false,
      object: { type: 'Identifier', start: 0, end: 5, name: 'globalThis' },
      property: { type: 'Identifier', start: 6, end: 10, name: 'Map' },
    };
  }
  const base = { form: 'replace', walkNode, isProxyGlobal: node => node, outerPrefix: () => [] };

  const omitted = subsume(region(), { ...base });
  checkTruthy('subsume/omitted rescue list skips the region', omitted.size > 0);
  checkDeep('subsume/undefined rescue list matches omitted',
    [...subsume(region(), { ...base, rescueRoots: undefined })].length, [...omitted].length);
  checkDeep('subsume/null rescue list matches omitted',
    [...subsume(region(), { ...base, rescueRoots: null })].length, [...omitted].length);
  check('subsume/an empty region is the empty set regardless of the list',
    subsume(null, { ...base, rescueRoots: null }).size, 0);

  // every form named in the contract is accepted; nothing else is
  for (const form of ['replace', 'dropped-key', 'kept-spine', 'init-globals']) {
    let threw = false;
    try {
      subsume(region(), { ...base, form, skippableTypes: new Set(), tsWrappers: new Set() });
    } catch { threw = true; }
    check(`subsume/known form ${ form } is accepted`, threw, false);
  }
  throwsWith('subsume/unknown form throws instead of answering "consumed nothing"',
    () => subsume(region(), { ...base, form: 'replace-all' }), 'unknown form');
  throwsWith('subsume/a missing form throws too',
    () => subsume(region(), { ...base, form: undefined }), 'unknown form');
  // the message carries the SUBSYSTEM prefix and no brand of its own: this throw happens during a
  // transform, where each plugin's outer catch stamps `[core-js] [<file>] ` exactly once. a
  // self-applied brand here would double-stamp, the same reason the queue's invariants stay bare
  {
    let message = '';
    try {
      subsume(region(), { ...base, form: 'nope' });
    } catch (error) { message = error.message; }
    check('subsume/throw is not self-branded', message.startsWith('[core-js]'), false);
    check('subsume/throw names its subsystem', message.startsWith('subsume: '), true);
  }
}

// --- usableAliasInfo: the read-time half of the injector's flow-trust refusal ---
// the rule is spelled once and asked at every read of an injector record, in both plugins; the
// domain is closed, so enumerate it - the flag decides, and nothing else about the record does
{
  check('usableAliasInfo/no record', usableAliasInfo(null), null);
  check('usableAliasInfo/undefined record', usableAliasInfo(undefined), null);
  const guarded = { hint: 'globalThis', entry: { name: '_globalThis' }, aliasGuarded: true };
  check('usableAliasInfo/guarded record declines', usableAliasInfo(guarded), null);
  const open = { hint: 'globalThis', entry: { name: '_globalThis' }, aliasGuarded: false };
  check('usableAliasInfo/unguarded record passes through', usableAliasInfo(open), open);
  const absent = { hint: 'Symbol', entry: null };
  check('usableAliasInfo/absent flag reads as unguarded', usableAliasInfo(absent), absent);
  // the flag is the ONLY question: an empty-but-unguarded record still passes, so a consumer
  // reading a missing field sees `undefined` from the record rather than the guard's `null`
  const empty = { aliasGuarded: false };
  check('usableAliasInfo/empty unguarded record still passes', usableAliasInfo(empty), empty);
  check('usableAliasInfo/consumer field of a declined record', usableAliasInfo(guarded)?.hint ?? null, null);
  check('usableAliasInfo/consumer field of an accepted record', usableAliasInfo(open)?.hint ?? null, 'globalThis');
}

// --- import-binding view: the type-only spelling lives on either side ---
// a specifier under `import type { X }` keeps its OWN kind 'value', so reading node-then-parent
// through a plain `??` stops at that 'value' and the binding reads as a runtime import - the exact
// shape a type-space shadow check asks about
{
  function decl(kind) {
    return { type: 'ImportDeclaration', importKind: kind, source: { value: 'immutable' } };
  }
  function named(specKind = 'value') {
    return { type: 'ImportSpecifier', importKind: specKind };
  }
  const rows = [
    ['import type { X }', named(), decl('type'), 'type'],
    ['import { type X }', named('type'), decl('value'), 'type'],
    ['import type X (default)', { type: 'ImportDefaultSpecifier' }, decl('type'), 'type'],
    ['flow import typeof { X }', named(), decl('typeof'), 'typeof'],
    ['plain value import', named(), decl('value'), 'value'],
  ];
  for (const [label, node, parent, want] of rows) {
    check(`importBindingView/${ label } reads as ${ want }`, importBindingView(node, parent).importKind, want);
    check(`importBindingView/${ label } keeps its source`, importBindingView(node, parent).importSource, 'immutable');
  }
  // a non-import binding carries neither field, whatever its own shape says
  const view = importBindingView({ type: 'VariableDeclarator', importKind: 'type' }, decl('type'));
  check('importBindingView/non-import binding has no kind', view.importKind, null);
  check('importBindingView/non-import binding has no source', view.importSource, null);
}

// entry-path segments back to registry keys. kebab -> camel alone cannot restore a capital that
// does not start a word, and every one of those misses reads as "not a known built-in" - silently,
// at whatever the caller's widest answer is
{
  function source(ns) { return `@core-js/pure/actual/${ ns }/constructor`; }
  const constructors = [
    ['map', 'Map'],
    ['weak-map', 'WeakMap'],
    // the conversion alone answers `Regexp` / `Url` / `UrlSearchParams` / `DomException` here
    ['regexp', 'RegExp'],
    ['url', 'URL'],
    ['url-search-params', 'URLSearchParams'],
    ['dom-exception', 'DOMException'],
  ];
  for (const [segment, want] of constructors) {
    check(`pureCtorNameFromImportSource/${ segment }`,
      pureCtorNameFromImportSource(source(segment), null, entryToGlobalHint), want);
  }
  // a namespace the hint index does not name keeps the plain conversion - dropping it would lose
  // constructors the index has no entry for
  check('pureCtorNameFromImportSource/outside the hint index',
    pureCtorNameFromImportSource(source('array-buffer'), null, entryToGlobalHint), 'ArrayBuffer');
  // and with no resolver injected at all, the conversion is all there is
  check('pureCtorNameFromImportSource/no resolver', pureCtorNameFromImportSource(source('url')), 'Url');

  const members = [
    ['Array', 'from', 'from'],
    ['Array', 'from-async', 'fromAsync'],
    ['Reflect', 'set-prototype-of', 'setPrototypeOf'],
    // the conversion answers `isNan` / `rawJson` / `isRawJson` / `utc` here
    ['Number', 'is-nan', 'isNaN'],
    ['JSON', 'raw-json', 'rawJSON'],
    ['JSON', 'is-raw-json', 'isRawJSON'],
    ['Date', 'utc', 'UTC'],
  ];
  for (const [constructor, segment, want] of members) {
    check(`staticMemberFromEntrySegment/${ constructor }.${ segment }`,
      staticMemberFromEntrySegment(constructor, segment), want);
  }
  // an unresolved constructor and a segment the table does not name both keep the plain
  // conversion rather than inventing a key
  check('staticMemberFromEntrySegment/no constructor',
    staticMemberFromEntrySegment(null, 'is-nan'), 'isNan');
  check('staticMemberFromEntrySegment/unknown member',
    staticMemberFromEntrySegment('Number', 'no-such-method'), 'noSuchMethod');
}

// the desugared-default ternary (`_ref === void 0 ? D : _ref`) is matched by SHAPE, and equality has
// no operand order - a lowering writes the reference first, a hand-written or minified guard just as
// readily writes the probe first. both spellings must answer the same, and a strict `=== null` must
// answer neither: it leaves `undefined` on the self branch, so folding to the default would collapse
// to a value the runtime never takes
{
  function ident(name) { return { type: 'Identifier', name }; }
  const VOID_ZERO = { type: 'UnaryExpression', operator: 'void', argument: { type: 'NumericLiteral', value: 0 } };
  const NULL_LITERAL = { type: 'NullLiteral' };
  const UNDEFINED_STRING = { type: 'StringLiteral', value: 'undefined' };
  function typeOf(name) { return { type: 'UnaryExpression', operator: 'typeof', argument: ident(name) }; }
  function ternary(left, operator, right) {
    return {
      type: 'ConditionalExpression',
      test: { type: 'BinaryExpression', operator, left, right },
      consequent: { type: 'ArrayExpression', elements: [] },
      alternate: ident('a'),
    };
  }
  const rows = [
    ['a === void 0', ident('a'), '===', VOID_ZERO, 'consequent'],
    ['void 0 === a', VOID_ZERO, '===', ident('a'), 'consequent'],
    ['a == null', ident('a'), '==', NULL_LITERAL, 'consequent'],
    ['null == a', NULL_LITERAL, '==', ident('a'), 'consequent'],
    ['typeof a === "undefined"', typeOf('a'), '===', UNDEFINED_STRING, 'consequent'],
    ['"undefined" === typeof a', UNDEFINED_STRING, '===', typeOf('a'), 'consequent'],
    ['a === null', ident('a'), '===', NULL_LITERAL, null],
    ['null === a', NULL_LITERAL, '===', ident('a'), null],
  ];
  for (const [label, left, operator, right, want] of rows) {
    check(`matchSelfDefaultTernarySlot/${ label }`, matchSelfDefaultTernarySlot(ternary(left, operator, right)), want);
  }
  // the inverse spelling puts the self-reference on the OTHER branch, in both operand orders
  const inverse = ternary(ident('a'), '!==', VOID_ZERO);
  inverse.consequent = ident('a');
  inverse.alternate = { type: 'ArrayExpression', elements: [] };
  check('matchSelfDefaultTernarySlot/a !== void 0', matchSelfDefaultTernarySlot(inverse), 'alternate');
  const inverseYoda = ternary(VOID_ZERO, '!==', ident('a'));
  inverseYoda.consequent = ident('a');
  inverseYoda.alternate = { type: 'ArrayExpression', elements: [] };
  check('matchSelfDefaultTernarySlot/void 0 !== a', matchSelfDefaultTernarySlot(inverseYoda), 'alternate');
}

// `nodeSpan` and the claim-SE regions are the two cross-dialect readers the emitters share: babel
// hands them CLONES, which keep `loc` and lose the numeric pair, while oxc hands them the numbers
// and no `loc`. both spellings have to answer the same, and the region split has to name three
// homes - an effect with no region at all is what makes a claim stand down.
{
  function shape(value) { return JSON.stringify(value); }
  check('nodeSpan/numeric pair leads', shape(nodeSpan({ start: 3, end: 9 })), shape({ start: 3, end: 9 }));
  check('nodeSpan/loc index answers a clone', shape(nodeSpan({ loc: { start: { index: 3 }, end: { index: 9 } } })), shape({ start: 3, end: 9 }));
  check('nodeSpan/numeric wins over loc', shape(nodeSpan({ start: 1, end: 2, loc: { start: { index: 7 }, end: { index: 8 } } })), shape({ start: 1, end: 2 }));
  check('nodeSpan/neither spelling answers', nodeSpan({ type: 'Identifier' }), null);
  check('nodeSpan/half a span is no span', nodeSpan({ start: 3 }), null);
  check('nodeSpan/nullish node', nodeSpan(null), null);

  const root = { start: 10, end: 20 };
  function se(start, end) { return { start, end }; }
  check('migratableClaimSe/no SE channel at all', shape(migratableClaimSe({ sideEffects: [], rootNode: root, end: 30 })), shape({ leading: [], migrated: [] }));
  const inside = se(12, 15);
  const after = se(21, 25);
  const before = se(2, 5);
  check('migratableClaimSe/inside the root rides in the test',
    shape(migratableClaimSe({ sideEffects: [inside], rootNode: root, end: 30 })), shape({ leading: [], migrated: [] }));
  check('migratableClaimSe/between root and claim migrates',
    shape(migratableClaimSe({ sideEffects: [after], rootNode: root, end: 30 })), shape({ leading: [], migrated: [after] }));
  check('migratableClaimSe/before the root leads',
    shape(migratableClaimSe({ sideEffects: [before], rootNode: root, end: 30 })), shape({ leading: [before], migrated: [] }));
  check('migratableClaimSe/all three regions at once',
    shape(migratableClaimSe({ sideEffects: [before, inside, after], rootNode: root, end: 30 })), shape({ leading: [before], migrated: [after] }));
  check('migratableClaimSe/an effect straddling the root has no region',
    migratableClaimSe({ sideEffects: [se(5, 15)], rootNode: root, end: 30 }), null);
  check('migratableClaimSe/an effect past the claim has no region',
    migratableClaimSe({ sideEffects: [se(31, 40)], rootNode: root, end: 30 }), null);
  check('migratableClaimSe/a position-less effect has no region',
    migratableClaimSe({ sideEffects: [{ type: 'CallExpression' }], rootNode: root, end: 30 }), null);
  check('migratableClaimSe/a CLONE root still answers',
    shape(migratableClaimSe({ sideEffects: [after], rootNode: { loc: { start: { index: 10 }, end: { index: 20 } } }, end: 30 })),
    shape({ leading: [], migrated: [after] }));
}

finish();
