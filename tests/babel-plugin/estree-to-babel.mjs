// Element-wise locks for `internals/estree-to-babel.js` - the binding-side converter of
// the canonical ESTree render. One lock per vocabulary element (totality is the contract:
// the converter throws outside the vocabulary, and that throw is locked too). The
// esrap-side spelling of the same canonical nodes needs no print here - the whole fixture
// corpus byte-locks it; what this suite proves is that @babel/generator prints the
// CONVERTED tree in the babel leg's own current spelling, chain dialect first.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const generateModule = requireBabel('@babel/generator');
import estreeToBabel from '../../packages/core-js-babel-plugin/internals/estree-to-babel.js';
import {
  assignmentExpression,
  bareImport,
  bareRequire,
  binaryExpression,
  callExpression,
  chainExpression,
  conditionalExpression,
  defaultImport,
  expressionStatement,
  identifier,
  literal,
  logicalExpression,
  memberExpression,
  objectExpression,
  objectProperty,
  sequenceExpression,
  unaryExpression,
  variableDeclaration,
  variableDeclarator,
  varRequire,
  voidZero,
  hostSlot,
  renderInstanceDefaultGuard,
} from '../../packages/core-js-polyfill-provider/render.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const generate = generateModule.default ?? generateModule;
const { check, checkTruthy, finish } = createChecker('estree-to-babel');

function print(node) {
  return generate(estreeToBabel(node), { comments: true }).code;
}

function caught(node) {
  try {
    estreeToBabel(node);
    return null;
  } catch (error) {
    return error.message;
  }
}

// --- per-element shape locks: every builder output converts, one lock per element ---
check('identifier', print(identifier('x')), 'x');
check('literal/string type', estreeToBabel(literal('a')).type, 'StringLiteral');
check('literal/string raw rides extra', estreeToBabel(literal('a')).extra.raw, '"a"');
check('literal/number', estreeToBabel(literal(7)).type, 'NumericLiteral');
check('literal/boolean', estreeToBabel(literal(true)).type, 'BooleanLiteral');
check('literal/null', estreeToBabel(literal(null)).type, 'NullLiteral');
// `NaN` / `Infinity` are in the mint domain but babel has no literal node for them: they
// convert to the Identifier babel itself parses; a bigint converts to babel's BigIntLiteral.
// negatives and `-0` the canon's mint gate refuses (see the builders) - a misminted one
// throws here instead of printing a wrong spelling (`-0` would print `0`, a wrong VALUE)
check('literal/NaN converts to the identifier', print(literal(NaN)), 'NaN');
check('literal/Infinity converts to the identifier', print(literal(Infinity)), 'Infinity');
check('literal/bigint converts to BigIntLiteral', estreeToBabel(literal(10n)).type, 'BigIntLiteral');
check('literal/bigint prints its own suffix', print(literal(10n)), '10n');
checkTruthy('literal/misminted negative number throws', caught({ type: 'Literal', value: -5 })?.includes('outside the canonical vocabulary'));
checkTruthy('literal/misminted minus zero throws', caught({ type: 'Literal', value: -0 })?.includes('outside the canonical vocabulary'));
checkTruthy('literal/misminted negative Infinity throws', caught({ type: 'Literal', value: -Infinity })?.includes('outside the canonical vocabulary'));
checkTruthy('literal/misminted negative bigint throws', caught({ type: 'Literal', value: -1n })?.includes('outside the canonical vocabulary'));
check('literal/plain zero stays a NumericLiteral', estreeToBabel(literal(0)).type, 'NumericLiteral');
check('literal/fraction stays a NumericLiteral', print(literal(1.5)), '1.5');
check('expressionStatement', print(expressionStatement(identifier('x'))), 'x;');
check('callExpression', print(callExpression(identifier('f'), [literal(1)])), 'f(1)');
check('memberExpression/plain', print(memberExpression(identifier('a'), identifier('b'))), 'a.b');
check('memberExpression/computed', print(memberExpression(identifier('a'), literal('k'), { computed: true })), 'a["k"]');
check('sequenceExpression', print(sequenceExpression([identifier('a'), identifier('b')])), 'a, b');
check('variableDeclaration', print(variableDeclaration('var', [variableDeclarator(identifier('a'))])), 'var a;');
check('variableDeclarator/init',
  print(variableDeclaration('const', [variableDeclarator(identifier('a'), literal(1))])), 'const a = 1;');
check('binaryExpression', print(binaryExpression('==', literal(null), identifier('x'))), 'null == x');
check('logicalExpression', print(logicalExpression('||', identifier('a'), identifier('b'))), 'a || b');
check('conditionalExpression', print(conditionalExpression(identifier('t'), voidZero(), identifier('x'))), 't ? void 0 : x');
check('unaryExpression keeps prefix', print(unaryExpression('!', identifier('x'))), '!x');
check('assignmentExpression', print(assignmentExpression('=', identifier('a'), identifier('b'))), 'a = b');
check('objectExpression + objectProperty',
  print(objectExpression([objectProperty(identifier('k'), identifier('v'))])), '{\n  k: v\n}');
check('objectProperty/computed becomes ObjectProperty',
  estreeToBabel(objectProperty(identifier('k'), identifier('v'), { computed: true })).type, 'ObjectProperty');
check('bareImport', print(bareImport('core-js/modules/es.array.flat')), 'import "core-js/modules/es.array.flat";');
check('defaultImport', print(defaultImport('_at', '@core-js/pure/actual/array/at')),
  'import _at from "@core-js/pure/actual/array/at";');
check('voidZero', print(voidZero()), 'void 0');
check('bareRequire', print(bareRequire('core-js/modules/es.array.flat')), 'require("core-js/modules/es.array.flat");');
check('varRequire', print(varRequire('_at', '@core-js/pure/actual/array/at')),
  'var _at = require("@core-js/pure/actual/array/at");');

// --- the chain dialect: ChainExpression dissolves into Optional*Expression links ---

// the exact memo-dispatch spelling both legs emit today: `_flatMapMaybeArray(_ref2 = res.data)?.call(_ref2, f)` -
// the `?.` is the MEMBER link's flag (`X?.call`), the call link itself is non-optional
const memoInit = assignmentExpression('=', identifier('_ref2'), memberExpression(identifier('res'), identifier('data')));
const memoRead = callExpression(identifier('_flatMapMaybeArray'), [memoInit]);
const memoCallee = memberExpression(memoRead, identifier('call'), { optional: true });
const memoDispatch = chainExpression(callExpression(memoCallee, [identifier('_ref2'), identifier('f')]));
check('chain/memo dispatch spelling', print(memoDispatch), '_flatMapMaybeArray(_ref2 = res.data)?.call(_ref2, f)');
check('chain/link types', estreeToBabel(memoDispatch).type, 'OptionalCallExpression');
check('chain/call link above the ?. is optional-typed with optional=false',
  estreeToBabel(memoDispatch).optional, false);
check('chain/member link carries the ?.', estreeToBabel(memoDispatch).callee.type, 'OptionalMemberExpression');
check('chain/member link optional=true', estreeToBabel(memoDispatch).callee.optional, true);
check('chain/link BELOW the first ?. stays plain',
  estreeToBabel(memoDispatch).callee.object.type, 'CallExpression');
// a sealed chain as the object of an outer OPTIONAL link: `(a?.b)?.c` and `a?.b?.c`
// short-circuit identically (the outer `?.` absorbs the seal), so the babel dialect may
// fuse them - grouping only, formatting-class. the seal that CARRIES semantics is a PLAIN
// read above the chain, locked below (`(a?.b).c` keeps its parens)
const resealed = chainExpression(memberExpression(
  chainExpression(memberExpression(identifier('a'), identifier('b'), { optional: true })),
  identifier('c'),
  { optional: true }));
check('chain/nested seal under an outer ?. fuses (runtime-equal)', print(resealed), 'a?.b?.c');

// plain continuation above an optional link (`a?.b.c`) - both links optional-typed, flags differ
const plainTail = chainExpression(memberExpression(
  memberExpression(identifier('a'), identifier('b'), { optional: true }),
  identifier('c')));
check('chain/plain continuation spelling', print(plainTail), 'a?.b.c');
check('chain/continuation link optional=false', estreeToBabel(plainTail).optional, false);

// an optional CALL on a bare callee (`f?.()`) and a computed optional member (`a?.[k]`)
const bareOptionalCall = chainExpression(callExpression(identifier('f'), [], { optional: true }));
check('chain/bare optional call', print(bareOptionalCall), 'f?.()');
check('chain/bare optional call base stays plain', estreeToBabel(bareOptionalCall).callee.type, 'Identifier');
const computedOptional = chainExpression(memberExpression(identifier('a'), identifier('k'), { computed: true, optional: true }));
check('chain/computed optional member', print(computedOptional), 'a?.[k]');
const doubleOptionalCall = chainExpression(callExpression(
  memberExpression(identifier('a'), identifier('b'), { optional: true }), [], { optional: true }));
check('chain/optional member then optional call', print(doubleOptionalCall), 'a?.b?.()');

// a seal ends the segment: `(a?.b).c` is a PLAIN member over an optional one
const sealed = memberExpression(
  chainExpression(memberExpression(identifier('a'), identifier('b'), { optional: true })),
  identifier('c'));
check('chain/seal boundary spelling', print(sealed), '(a?.b).c');
check('chain/seal boundary types', estreeToBabel(sealed).type, 'MemberExpression');

// --- host slots: an embedded babel subtree passes through UNCONVERTED ---
{
  // identity: the slot unwraps to the very node, undescended - a babel-only inner type
  // (ArrowFunctionExpression is outside the vocabulary) proves the converter never walked in
  const hostNode = { type: 'ArrowFunctionExpression', params: [], body: { type: 'Identifier', name: 'x' } };
  checkTruthy('host-slot/unwraps to the very node', estreeToBabel(hostSlot(hostNode)) === hostNode);
  const shell = callExpression(identifier('f'), [hostSlot(hostNode)]);
  checkTruthy('host-slot/inside a canonical shell passes through by identity',
    estreeToBabel(shell).arguments[0] === hostNode);
  // the one guard shape both legs print, host operands embedded
  const ref = { type: 'Identifier', name: '_ref' };
  const guard = renderInstanceDefaultGuard({
    assignedRef: hostSlot(ref),
    call: hostSlot({ type: 'CallExpression', callee: { type: 'Identifier', name: '_at' }, arguments: [] }),
    defaultValue: hostSlot({ type: 'ObjectExpression', properties: [] }),
    reread: hostSlot(ref),
  });
  check('host-slot/instance default guard prints the canonical spelling',
    generate(estreeToBabel(guard)).code, '(_ref = _at()) === void 0 ? {} : _ref');
}

// --- totality: outside the vocabulary or misminted = loud throw, never a wrong print ---
checkTruthy('totality/unknown type throws', caught({ type: 'ArrowFunctionExpression' })?.includes('outside the canonical vocabulary'));
checkTruthy('totality/optional member outside chain throws',
  caught(memberExpression(identifier('a'), identifier('b'), { optional: true }))?.includes('outside a ChainExpression'));
checkTruthy('totality/optional call outside chain throws',
  caught(callExpression(identifier('f'), [], { optional: true }))?.includes('outside a ChainExpression'));
checkTruthy('totality/nullish input throws controlled', caught(null)?.includes('outside the canonical vocabulary'));

// --- purity: the canon reuses nodes, so conversion may not mutate or alias its input ---
const frozenChain = chainExpression(memberExpression(identifier('a'), identifier('b'), { optional: true }));
(function deepFreeze(node) {
  if (node && typeof node === 'object') {
    Object.freeze(node);
    for (const child of Object.values(node)) deepFreeze(child);
  }
})(frozenChain);
check('purity/converts a deeply frozen input', print(frozenChain), 'a?.b');
// the meta-cloning path under freeze too: spreading and WeakMap-keying must not write
const frozenMeta = identifier('m');
frozenMeta.loc = { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } };
frozenMeta.range = [5, 6];
frozenMeta.leadingComments = [{ type: 'Line', value: ' held', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } } }];
(function deepFreeze(node) {
  if (node && typeof node === 'object') {
    Object.freeze(node);
    for (const child of Object.values(node)) deepFreeze(child);
  }
})(frozenMeta);
check('purity/frozen input with meta converts', estreeToBabel(frozenMeta).leadingComments[0].type, 'CommentLine');
checkTruthy('purity/output aliases nothing from the input',
  estreeToBabel(frozenChain).object !== frozenChain.expression.object);

// --- meta contract: loc/start/end copied per node; comment types convert ---
const withMeta = identifier('x');
withMeta.start = 3;
withMeta.end = 4;
withMeta.loc = { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } };
withMeta.range = [3, 4];
withMeta.leadingComments = [{ type: 'Line', value: ' note', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } } }];
const convertedMeta = estreeToBabel(withMeta);
check('meta/start survives', convertedMeta.start, 3);
check('meta/loc survives', convertedMeta.loc.end.column, 4);
check('meta/comment type converts', convertedMeta.leadingComments[0].type, 'CommentLine');
// the canon reuses its nodes: positions are CLONED, never shared - element-wise over
// every meta object (loc, its endpoints, range, the comment's own loc)
checkTruthy('meta/loc is a clone, not the input object', convertedMeta.loc !== withMeta.loc);
checkTruthy('meta/loc.start is a clone', convertedMeta.loc.start !== withMeta.loc.start);
checkTruthy('meta/loc.end is a clone', convertedMeta.loc.end !== withMeta.loc.end);
checkTruthy('meta/range is a clone', convertedMeta.range !== withMeta.range);
check('meta/range values survive', convertedMeta.range.join(','), '3,4');
checkTruthy('meta/comment loc is a clone', convertedMeta.leadingComments[0].loc !== withMeta.leadingComments[0].loc);
check('meta/comment loc values survive', convertedMeta.leadingComments[0].loc.end.column, 7);
// innerComments ride the same conversion as leading/trailing - locked element-wise
const withInner = objectExpression([]);
withInner.innerComments = [{ type: 'Block', value: ' inner ' }];
check('meta/innerComments convert too', estreeToBabel(withInner).innerComments[0].type, 'CommentBlock');
const nestedMeta = memberExpression(withMeta, identifier('p'));
check('meta/copied per NODE, not only at the root', estreeToBabel(nestedMeta).object.start, 3);
// babel prints a comment once per OBJECT: a comment shared by a trailing and the next
// node's leading array must stay ONE object after conversion - across separate calls too,
// the way an injector converts statement by statement
const sharedComment = { type: 'Line', value: ' shared note' };
const firstOwner = expressionStatement(identifier('one'));
firstOwner.trailingComments = [sharedComment];
const secondOwner = expressionStatement(identifier('two'));
secondOwner.leadingComments = [sharedComment];
const convertedFirst = estreeToBabel(firstOwner);
const convertedSecond = estreeToBabel(secondOwner);
checkTruthy('meta/shared comment object survives as ONE object across calls',
  convertedFirst.trailingComments[0] === convertedSecond.leadingComments[0]);
check('meta/shared comment prints once, not twice',
  generate({ type: 'Program', sourceType: 'module', body: [convertedFirst, convertedSecond], directives: [] },
    { comments: true }).code, 'one; // shared note\ntwo;');

// --- host acceptance: converted nodes survive babel's OWN pipeline (traverse, scope,
// insertion), not only its printer - the insertion boundary the converter exists for ---
const { transformAsync } = requireBabel('@babel/core');
let hostBinding = null;
const hostImport = await transformAsync('user(_at);', { configFile: false, plugins: [{ visitor: { Program(programPath) {
  programPath.unshiftContainer('body', [estreeToBabel(defaultImport('_at', '@core-js/pure/actual/array/at'))]);
  programPath.scope.crawl();
  hostBinding = !!programPath.scope.getBinding('_at');
} } }] });
check('host/inserted import prints in place',
  hostImport.code.startsWith('import _at from "@core-js/pure/actual/array/at";'), true);
checkTruthy('host/scope registers the inserted binding', hostBinding);
const hostCallee = memberExpression(identifier('_flat'), identifier('call'), { optional: true });
const hostDispatch = expressionStatement(chainExpression(callExpression(hostCallee, [identifier('x')])));
const hostRequire = await transformAsync('user();', { configFile: false, sourceType: 'script', plugins: [{ visitor: { Program(programPath) {
  programPath.unshiftContainer('body', [estreeToBabel(varRequire('_flat', 'core-js-pure/actual/array/flat')), estreeToBabel(hostDispatch)]);
} } }] });
check('host/require and chain insert traversably', hostRequire.code.includes('_flat?.call(x);'), true);

finish();
