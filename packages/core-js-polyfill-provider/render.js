import { isValidIdentifierName } from './helpers/ast-patterns.js';
// the render canon's node factory - the one place emitted nodes take shape, in the
// canonical ESTree dialect. unplugin inserts these nodes as is; the babel binding converts
// them at the insertion boundary (its `internals/estree-to-babel.js`, total over exactly
// this vocabulary). names mirror @babel/types so the mapping reads at a glance;
// estree-toolkit's builders are not used here because they carry validation weight and no
// `raw` control (quote spelling parity)
import { polyfillOrderComparator, sortByPolyfillOrder } from './plugin-options/inject.js';

export function identifier(name) {
  return { type: 'Identifier', name };
}

// `raw` is the printer's PREFERRED spelling, and only a string needs one from us: esrap
// quotes with `'` by default and babel prints `"`, so a path / key spells its own; every
// other value the printer derives itself, correctly - `JSON.stringify` would not (it THROWS
// on a bigint and answers `null` for NaN / Infinity, a different value than the node holds).
// the domain is what a PARSER can put in a `Literal`:
// negatives never parse into one (`-5` is a unary minus over `5`) and are spelled by
// composition, never smuggled through a Literal - and `-0` both printers would derive from
// the value as `"0"`, a wrong VALUE, so minting any of them throws
export function literal(value) {
  if (typeof value === 'string') return { type: 'Literal', value, raw: JSON.stringify(value) };
  if (typeof value === 'number' && (value < 0 || Object.is(value, -0))) {
    throw new TypeError(`[builders] negative number outside the canonical Literal domain: ${ value }`);
  }
  if (typeof value === 'bigint' && value < 0n) {
    throw new TypeError(`[builders] negative bigint outside the canonical Literal domain: ${ value }n`);
  }
  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean' || value === null) {
    return { type: 'Literal', value };
  }
  throw new TypeError(`[builders] value outside the canonical Literal domain: ${ typeof value }`);
}

export function expressionStatement(expression) {
  return { type: 'ExpressionStatement', expression };
}

export function callExpression(callee, args, { optional = false } = {}) {
  return { type: 'CallExpression', callee, arguments: args, optional };
}

export function memberExpression(object, property, { computed = false, optional = false } = {}) {
  return { type: 'MemberExpression', object, property, computed, optional };
}

export function sequenceExpression(expressions) {
  return { type: 'SequenceExpression', expressions };
}

export function variableDeclaration(kind, declarations) {
  return { type: 'VariableDeclaration', kind, declarations };
}

export function variableDeclarator(id, init = null) {
  return { type: 'VariableDeclarator', id, init };
}

export function binaryExpression(operator, left, right) {
  return { type: 'BinaryExpression', operator, left, right };
}

export function logicalExpression(operator, left, right) {
  return { type: 'LogicalExpression', operator, left, right };
}

export function conditionalExpression(test, consequent, alternate) {
  return { type: 'ConditionalExpression', test, consequent, alternate };
}

export function unaryExpression(operator, argument) {
  return { type: 'UnaryExpression', operator, argument, prefix: true };
}

export function chainExpression(expression) {
  return { type: 'ChainExpression', expression };
}

export function voidZero() {
  return unaryExpression('void', literal(0));
}

export function assignmentExpression(operator, left, right) {
  return { type: 'AssignmentExpression', operator, left, right };
}

export function objectExpression(properties) {
  return { type: 'ObjectExpression', properties };
}

export function objectProperty(key, value, { computed = false } = {}) {
  return { type: 'Property', kind: 'init', method: false, shorthand: false, computed, key, value };
}

export function bareImport(path) {
  return { type: 'ImportDeclaration', specifiers: [], source: literal(path), attributes: [] };
}

export function defaultImport(name, path) {
  return {
    type: 'ImportDeclaration',
    specifiers: [{ type: 'ImportDefaultSpecifier', local: identifier(name) }],
    source: literal(path),
    attributes: [],
  };
}

export function bareRequire(path) {
  return expressionStatement(callExpression(identifier('require'), [literal(path)]));
}

export function varRequire(name, path) {
  return variableDeclaration('var', [variableDeclarator(identifier(name), callExpression(identifier('require'), [literal(path)]))]);
}

// a deep clone for node REUSE (a receiver spliced into two slots must not share identity -
// the walkers and the printer's loc pass mutate in place); loc/start/end survive the copy
// so a cloned user node keeps its mapping
export function cloneNode(node) {
  if (Array.isArray(node)) return node.map(item => cloneNode(item));
  if (!node || typeof node !== 'object') return node;
  const out = {};
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in node) out[key] = cloneNode(node[key]);
  return out;
}

// --- the injected import set, rendered ---

// the ONE spelling of the injected imports, in the one order both emitters print: globals
// as side-effect imports, pure entries as default-import bindings, the require dialect
// swapping both statement forms. returns { node, key } pairs - `key` is the canonical-order
// key the babel binding's late import-region reorder tracks per node
export function renderInjectedImportNodes({
  globalModules,
  pureEntries,
  importStyle,
  resolve,
  globalPackages = null,
}) {
  const isRequire = importStyle === 'require';
  const rendered = [];
  for (const moduleName of sortByPolyfillOrder(globalModules)) {
    // each global module resolves under the package it was recognised under - the emitter's own
    // for what it injected, the user's for what the scan adopted from the source
    const path = resolve(`modules/${ moduleName }`, globalPackages?.get(moduleName));
    rendered.push({ node: isRequire ? bareRequire(path) : bareImport(path), key: moduleName });
  }
  for (const [source, name] of [...pureEntries].sort(([a], [b]) => polyfillOrderComparator(a, b))) {
    const path = resolve(source);
    rendered.push({ node: isRequire ? varRequire(name, path) : defaultImport(name, path), key: source });
  }
  return rendered;
}

// `__proto__:` in an OBJECT LITERAL is the prototype-setter form, not an own property - a
// synth literal mirroring a `__proto__` pattern key must spell it COMPUTED
// (`['__proto__']:`) so the destructured read gets an OWN property and the literal keeps
// its own prototype; both legs' synth renders ask this one rule
export function synthKeyMustBeComputed(keyNode) {
  if (keyNode?.type === 'Identifier') return keyNode.name === '__proto__';
  const literalish = keyNode?.type === 'Literal' || keyNode?.type === 'StringLiteral';
  return literalish && keyNode.value === '__proto__';
}

// --- host slots: an already-host-dialect subtree riding inside a canonical shell ---

// the wrapper type a binding's own subtree travels under through the canonical renders
export const HOST_SLOT = 'CoreJsHostSlot';

// the unplugin leg's host dialect IS canonical ESTree, so it never mints this wrapper (its
// renders embed the subtree directly); the babel binding wraps each embedded babel subtree
// in a host slot, and its converter unwraps the slot at the insertion boundary, passing the
// subtree through unconverted. the wrapper NEVER survives into an inserted tree
export function hostSlot(node) {
  return { type: HOST_SLOT, node };
}

// --- destructure renders (growing per cluster demand) ---

// the literal spelling of one render-plan entry: the source key node when the prop was
// plain, the resolved plain name when a literal-computed spelling collapsed onto it, the
// computed identifier for a `[k]` slot
export function synthEntryKey({ keyNode, dedupKey, slotKey, lookupKey, computedKey = false }, { resolvedSpelling = false } = {}) {
  // the nested mirror spells the RESOLVED name (`{ Array: { from: _X } }`); the flat
  // literal keeps the source spelling (`['from']: _X` / `[k]: _X`), both the babel shapes
  if (resolvedSpelling) return { key: identifier(lookupKey), computed: false };
  if (keyNode) {
    // a NUMERIC source key respells as its string form in the synth literal (`0:` -> `"0":`,
    // the passthrough reading `Object["0"]`) - both dialects spell such a key their own way
    // (estree `Literal`, babel `NumericLiteral`), and the respelling is what erases that
    if (keyNode.type === 'NumericLiteral' || (keyNode.type === 'Literal' && typeof keyNode.value === 'number')) {
      return { key: literal(String(keyNode.value)), computed: computedKey };
    }
    // ... every other source key is CARRIED, not rebuilt: it is the caller's own node in the
    // caller's own dialect. `fromSource` marks it, and the caller MUST clone before embedding -
    // the node still sits in the source pattern, and one node in two tree positions aliases
    // every later mutation (a span stamp, a key swap, a skip mark) across both
    return { key: keyNode, computed: computedKey, fromSource: true };
  }
  const bracket = /^\[(?<name>[$a-z_][\w$]*)\]$/i.exec(slotKey);
  if (slotKey === dedupKey && bracket) return { key: identifier(bracket.groups.name), computed: true };
  // a FOLDED computed key (an SE prefix, a literal spelling) lands as its string literal,
  // and its passthrough reads back computed with the same literal - the babel spelling
  return { key: literal(lookupKey), computed: false };
}

// a member hop spelled by KEY NAME: a valid identifier reads after a dot, anything else
// reads computed with its string (`_globalThis["App-Key"]`)
export function memberFromKeyName(object, keyName, options = {}) {
  return isValidIdentifierName(keyName)
    ? memberExpression(object, identifier(keyName), options)
    : memberExpression(object, literal(keyName), { ...options, computed: true });
}

// one property of a synthesized literal, keyed by the SLOT NOTATION the synth families use:
// a `[k]` bracket slot replays the binding computed, a plain identifier name reads as itself,
// anything else (a dashed / numeric / dotted name) spells its string
export function synthProperty(key, value) {
  const bracket = /^\[(?<name>[$a-z_][\w$]*)\]$/i.exec(key);
  if (bracket) return objectProperty(identifier(bracket.groups.name), value, { computed: true });
  if (/^[$a-z_][\w$]*$/i.test(key)) return objectProperty(identifier(key), value);
  return objectProperty(literal(key), value);
}

// the SLOT READ off a receiver base: a key the literal spelled as a STRING reads back computed
// with that same string (`"k": recv["k"]`, `"0": recv["0"]`) - a dot form would print different
// source text for the same read, and a numeric / string key has no identifier to spell after a
// dot at all; every other key reads through its resolved name
export function renderSynthSlotRead({ base, key, computed, lookupKey }) {
  // a host-slotted key is the caller's own node passing through - its SPELLING still decides
  const spelled = key.type === HOST_SLOT ? key.node : key;
  const literalKey = !computed && (spelled.type === 'Literal' || spelled.type === 'StringLiteral');
  return memberExpression(base, computed || literalKey ? cloneNode(key) : identifier(lookupKey),
    { computed: computed || literalKey });
}

// the `(ref = <dispatcher call>) === void 0 ? <default> : ref` guard for an instance
// extraction carrying a user default: the dispatcher may return undefined on a foreign
// receiver (its own-property read), so the default stays LIVE - polyfill-always-wins covers
// only always-defined static/global bindings. every operand arrives ALREADY embedded (the
// leg clones and wraps its host nodes); this spells the ONE guard shape both legs print
export function renderInstanceDefaultGuard({ assignedRef, call, defaultValue, reread }) {
  return conditionalExpression(
    binaryExpression('===', assignmentExpression('=', assignedRef, call), voidZero()),
    defaultValue,
    reread,
  );
}

// the static twin: the read needs no memo (an import binding or a plain ref re-reads for
// free), so the guard tests it directly - `<read> === void 0 ? <default> : <reread>`
export function renderStaticDefaultGuard({ read, defaultValue, reread }) {
  return conditionalExpression(binaryExpression('===', read, voidZero()), defaultValue, reread);
}
