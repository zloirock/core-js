// Decision tests for the WELL-KNOWN-SYMBOL key canon of the synth families: the shape
// recognizer and the slot it mints (both pure functions), and the scope-aware fold that
// answers which symbol a key names whatever spelling it wears - through both parsers,
// since the fold rides each parser's own binding + polyfill-hint channel
import {
  hasRealBinding,
  isReplayableSynthKey,
  isSynthSimpleObjectPattern,
  spelledSlotName,
  synthSlotName,
  synthSwapPropKey,
  wksComputedKeyName,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { computedKeyWellKnownSymbolName } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { buildNestedDestructurePlan } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { SYMBOL_STATIC_KEYS } from '../../packages/core-js-polyfill-provider/detect-usage/globals.js';
import {
  buildNestedParamSynthPlan,
  buildPatternRenderPlan,
  isReReferenceableAcrossReads,
  planNestedKeyedPatternCapture,
  paramDefaultInstanceSynthAllowed,
  patternComputedKeysSynthSafe,
  planSideEffectKeyStrategy,
  renderSynthTree,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { synthEntryKey } from '../../packages/core-js-polyfill-provider/render.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, checkTruthy, finish, runBoth } = createChecker('synth-wks-keys');

function member(objectName, propertyName) {
  return {
    type: 'MemberExpression',
    computed: false,
    optional: false,
    object: { type: 'Identifier', name: objectName },
    property: { type: 'Identifier', name: propertyName },
  };
}
// a computed key whose value is only reachable past an effect - the one shape the two namers split on
function sequenceKey(value) {
  return {
    type: 'SequenceExpression',
    expressions: [
      { type: 'CallExpression', callee: { type: 'Identifier', name: 'eff' }, arguments: [] },
      { type: 'StringLiteral', value },
    ],
  };
}

function prop(key, computed) {
  return { type: 'ObjectProperty', computed, key, value: { type: 'Identifier', name: 'v' } };
}

// --- wksComputedKeyName: the SHAPE recognizer ---

check('shape/direct wks member', wksComputedKeyName(member('Symbol', 'iterator')), 'iterator');
check('shape/any symbol name', wksComputedKeyName(member('Symbol', 'asyncIterator')), 'asyncIterator');
check('shape/other object declines', wksComputedKeyName(member('Sym', 'iterator')), null);
check('shape/computed property declines', wksComputedKeyName({ ...member('Symbol', 'iterator'), computed: true }), null);
check('shape/optional member declines', wksComputedKeyName({ ...member('Symbol', 'iterator'), optional: true }), null);
check('shape/plain identifier declines', wksComputedKeyName({ type: 'Identifier', name: 'k' }), null);

// --- the slot such a key mints ---

// `@@` notation cannot collide with a string fold (which quotes) or a bound-identifier slot
check('slot/wks key', synthSwapPropKey(prop(member('Symbol', 'iterator'), true)), '[@@iterator]');
check('slot/bound identifier key', synthSwapPropKey(prop({ type: 'Identifier', name: 'k' }, true)), '[k]');
check('slot/string fold key', synthSwapPropKey(prop({ type: 'StringLiteral', value: 'from' }, true)), '["from"]');
check('slot/unresolvable key names no slot', synthSwapPropKey(prop(member('window', 'k'), true)), null);

// --- the admissions that let it into a synth ---

checkTruthy('admit/wks key is replayable', isReplayableSynthKey(prop(member('Symbol', 'iterator'), true)));
check('admit/unresolvable key is not', isReplayableSynthKey(prop(member('window', 'k'), true)), false);
checkTruthy('admit/pattern with a wks key synths',
  isSynthSimpleObjectPattern({ type: 'ObjectPattern', properties: [
    prop({ type: 'Identifier', name: 'at' }, false),
    prop(member('Symbol', 'iterator'), true),
  ] }));
check('admit/pattern with an unresolvable key does not',
  isSynthSimpleObjectPattern({ type: 'ObjectPattern', properties: [
    prop({ type: 'Identifier', name: 'at' }, false),
    prop(member('window', 'k'), true),
  ] }), false);

// --- computedKeyWellKnownSymbolName: the scope-aware fold ---

// the minimal adapter contract the key fold consumes: literal reading plus the scope's own
// binding view (a real emitter additionally serves its injector registry through these)
const keyAdapter = {
  isStringLiteral(n) { return n.type === 'StringLiteral' || (n.type === 'Literal' && typeof n.value === 'string'); },
  getStringValue(n) { return n.value; },
  hasBinding(scope, name) { return !!scope?.getBinding?.(name); },
  getBinding(scope, name) { return scope?.getBinding?.(name) ?? null; },
  method: 'usage-pure',
};
function foldKey(adapter, prog) {
  const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
  const keyPath = adapter.pickPath(prog, type, p => p.node.computed);
  return computedKeyWellKnownSymbolName({
    keyNode: keyPath.node.key, scope: keyPath.scope, adapter: keyAdapter, path: keyPath,
  });
}

runBoth('fold/direct spelling', 'const { [Symbol.iterator]: it } = o;', (adapter, prog, lbl) => {
  check(lbl, foldKey(adapter, prog), 'iterator');
});

runBoth('fold/user alias', 'const s = Symbol.iterator; const { [s]: it } = o;', (adapter, prog, lbl) => {
  check(lbl, foldKey(adapter, prog), 'iterator');
});

// a SHADOWED `Symbol` names the user's own object, never the symbol registry
runBoth('fold/shadowed Symbol declines', 'const Symbol = { iterator: 1 }; const { [Symbol.iterator]: it } = o;', (adapter, prog, lbl) => {
  check(lbl, foldKey(adapter, prog), null);
});

// a pure CTOR standing in for a bare global folds to no symbol - the gates that ride this
// answer must keep it out of the literal, where a raw emission would ReferenceError
runBoth('fold/ctor key declines', 'const { [Set]: y } = o;', (adapter, prog, lbl) => {
  check(lbl, foldKey(adapter, prog), null);
});

runBoth('fold/string key declines', 'const { ["from"]: f } = o;', (adapter, prog, lbl) => {
  check(lbl, foldKey(adapter, prog), null);
});

// a STRING spelling of the symbol's own name folds to the same text - provenance is what
// separates it: `o["Symbol.iterator"]` reads an ordinary property called that, and reading it
// through the symbol instead SUBSTITUTES a different value
runBoth('fold/string spelling of the name declines', 'const { ["Symbol.iterator"]: x } = o;', (adapter, prog, lbl) => {
  check(lbl, foldKey(adapter, prog), null);
});

runBoth('fold/template spelling declines', 'const { [`Symbol.iterator`]: x } = o;', (adapter, prog, lbl) => {
  check(lbl, foldKey(adapter, prog), null);
});

// ... and a CONCATENATION reaching the same text is the same plain read
runBoth('fold/concat spelling declines', "const { ['Symbol.' + 'iterator']: x } = o;", (adapter, prog, lbl) => {
  check(lbl, foldKey(adapter, prog), null);
});

// --- synthEntryKey: which keys are CARRIED and which are respelled ---

// Resolved names are literal property names, never the synth map's bracket-slot notation.
for (const [name, type, computed] of [
  ['Array', 'Identifier', false],
  ['with-dash', 'Literal', false],
  ['[key]', 'Literal', false],
  ['', 'Literal', false],
  ['__proto__', 'Literal', true],
]) {
  const spelled = synthEntryKey({ lookupKey: name }, { resolvedSpelling: true });
  checkDeep(`spelling/resolved ${ name }`, [spelled.key.type, spelled.key.name ?? spelled.key.value, spelled.computed], [type, name, computed]);
}

// Quoted and identifier keys share the ordinary mirror's data-property vocabulary.
for (const name of ['nativeSlot', 'with-dash', '[key]', '', '__proto__']) {
  const tree = renderSynthTree({ kind: 'object', entries: [
    { key: 'polyfill', child: { kind: 'polyfill', entry: 'array/of', hintName: '_of' } },
    { key: name, child: { kind: 'passthrough', bailed: true } },
  ] }, { injectImport: (entry, hintName) => hintName, receiverName: 'source', receiverIsProxy: false });
  checkDeep(`mirror/data slots ${ name }`, tree.properties.map(property => property.kind), ['init', 'init']);
  check(`mirror/native read ${ name }`, tree.properties[1].value.type, 'MemberExpression');
}

// a carried key is the caller's OWN node: the descriptor says so, and the caller has to clone
// before embedding - one node in two tree positions aliases every later mutation across both
runBoth('spelling/computed source key is carried', 'const { ["z"]: v } = o;', (adapter, prog, lbl) => {
  const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
  const keyNode = adapter.pickPath(prog, type).node.key;
  const spelled = synthEntryKey({ keyNode, dedupKey: 'z', slotKey: '["z"]', lookupKey: 'z', computedKey: true });
  checkTruthy(`${ lbl } fromSource`, spelled.fromSource);
  check(`${ lbl } identity`, spelled.key === keyNode, true);
});

// a NUMERIC key is respelled as its string form instead - each dialect spells such a key its
// own way, and the respelling is what erases that
runBoth('spelling/numeric key is respelled', 'const { 0: v } = o;', (adapter, prog, lbl) => {
  const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
  const keyNode = adapter.pickPath(prog, type).node.key;
  const spelled = synthEntryKey({ keyNode, dedupKey: '0', slotKey: '0', lookupKey: '0', computedKey: false });
  check(`${ lbl } fromSource`, !!spelled.fromSource, false);
  check(`${ lbl } value`, spelled.key.value, '0');
});

// --- hasRealBinding: does anything in a pattern still bind a real name? ---

// the whole-consume drop asks this before removing a declarator, and BOTH dialects reach it -
// a dialect-blind walk answered "nothing binds" for babel's own patterns and dropped a live
// user binding with the residual
runBoth('binding/live name is found', 'const { at: kept } = o;', (adapter, prog, lbl) => {
  const pattern = adapter.pickPath(prog, 'ObjectPattern');
  checkTruthy(lbl, hasRealBinding(pattern.node, new Set(['_unused'])));
});

runBoth('binding/all sentinels', 'const { at: _unused, keys: _unused2 } = o;', (adapter, prog, lbl) => {
  const pattern = adapter.pickPath(prog, 'ObjectPattern');
  check(lbl, hasRealBinding(pattern.node, new Set(['_unused', '_unused2'])), false);
});

runBoth('binding/nested live name', 'const { inner: { at: kept } } = o;', (adapter, prog, lbl) => {
  const pattern = adapter.pickPath(prog, 'ObjectPattern');
  checkTruthy(lbl, hasRealBinding(pattern.node, new Set(['_unused'])));
});

runBoth('binding/rest binds', 'const { at: _unused, ...rest } = o;', (adapter, prog, lbl) => {
  const pattern = adapter.pickPath(prog, 'ObjectPattern');
  checkTruthy(lbl, hasRealBinding(pattern.node, new Set(['_unused'])));
});

// --- buildPatternRenderPlan: the shared render plan both emitters read ---

function planOf(adapter, prog) {
  const pattern = adapter.pickPath(prog, 'ObjectPattern');
  return buildPatternRenderPlan(pattern.node, { scope: pattern.scope, path: pattern, adapter: keyAdapter });
}

for (const [label, source, expected, distinctReads = false] of [
  ['plain', 'function f({ at } = []) {}', true],
  ['known string', 'const key = "length"; function f({ at, [key]: other } = []) {}', true],
  ['literal', 'function f({ at, ["length"]: other } = []) {}', true],
  ['symbol', 'function f({ at, [Symbol.iterator]: other } = []) {}', true],
  ['symbol alias', 'const key = Symbol.iterator; function f({ at, [key]: other } = []) {}', true],
  ['parameter', 'function f(key, { at, [key]: other } = []) {}', false],
  ['object coercion', 'const key = { toString() { return "at"; } }; function f({ at, [key]: other } = []) {}', false],
  ['unknown import', 'import key from "key"; function f({ at, [key]: other } = []) {}', false],
  ['unbound', 'function f({ at, [key]: other } = []) {}', false],
  ['duplicate instance', 'function f({ at, at: other } = []) {}', false, true],
  ['aliased duplicate instance', 'const key = "at"; function f({ at, [key]: other } = []) {}', false, true],
  ['distinct instance', 'const key = "length"; function f({ at, [key]: other } = []) {}', true, true],
  ['immutable static duplicate', 'function f({ from, from: other } = Array) {}', true],
]) runBoth(`mirror key proof/${ label }`, source, (adapter, prog, lbl) => {
  const pattern = adapter.pickPath(prog, 'ObjectPattern');
  check(lbl, patternComputedKeysSynthSafe({ objectPatternNode: pattern.node, scope: pattern.scope, path: pattern, adapter: keyAdapter, distinctReads }), expected);
});

// the numeric and string spellings name ONE slot, and the literal may hold a key once - the
// plan collapses them, so both reads destructure the value the single entry renders
runBoth('plan/one slot per spelling', 'const { 0: a, "0": b } = o;', (adapter, prog, lbl) => {
  const plan = planOf(adapter, prog);
  check(`${ lbl } entries`, plan?.length, 1);
  check(`${ lbl } slot`, plan?.[0]?.dedupKey, '0');
});

// a WKS key slots under its `@@` notation whatever spelling names it, so a registration made
// before an emitter's key swap still meets the render made after it
runBoth('plan/wks slot notation', 'const { [Symbol.iterator]: it, at } = o;', (adapter, prog, lbl) => {
  const plan = planOf(adapter, prog);
  checkDeep(`${ lbl } slots`, plan?.map(entry => entry.dedupKey), ['[@@iterator]', 'at']);
  check(`${ lbl } respelled`, plan?.[0]?.wksSpelling, 'iterator');
  check(`${ lbl } carries no source key`, plan?.[0]?.keyNode, null);
});

for (const [prefix, entries] of [
  ['', '[Symbol.iterator]: symbol, "[@@iterator]": own'],
  ['', '[Symbol.iterator]: symbol, ["[@@iterator]"]: own'],
  ['const symbolKey = Symbol.iterator;', '[symbolKey]: symbol, ["[@@iterator]"]: own'],
  ['const key = "from";', '[key]: variable, "[key]": own'],
]) runBoth('plan/symbol and binding labels cannot collide with string properties',
  `${ prefix } const { ${ entries } } = o;`, (adapter, prog, lbl) => {
    const plan = planOf(adapter, prog);
    check(`${ lbl }: separate property reads/${ entries }`, plan?.length, 2);
    check(`${ lbl }: separate map keys/${ entries }`, new Set(plan?.map(entry => entry.dedupKey)).size, 2);
  });

for (const computed of [false, true]) {
  const names = ['[@@iterator]', '[key]', '["from"]', '"[@@iterator]"', '"[key]"'];
  const entries = names.map((name, index) => `${ computed ? `[${ JSON.stringify(name) }]` : JSON.stringify(name) }: own${ index }`).join(', ');
  runBoth('plan/escaped property labels remain distinct and keep their runtime spelling',
    `const key = "from"; const { [Symbol.iterator]: symbol, [key]: variable, ${ entries } } = o;`, (adapter, prog, lbl) => {
      const plan = planOf(adapter, prog);
      check(`${ lbl }: all string and symbolic slots/${ computed }`, plan?.length, names.length + 2);
      check(`${ lbl }: unique map keys/${ computed }`, new Set(plan?.map(entry => entry.dedupKey)).size, names.length + 2);
      checkDeep(`${ lbl }: runtime property names/${ computed }`, plan?.slice(2).map(entry => entry.lookupKey), names);
    });
}

for (const name of SYMBOL_STATIC_KEYS) runBoth('plan/every Symbol static remains distinct from its string label',
  `const { [Symbol.${ name }]: symbol, ${ JSON.stringify(`[@@${ name }]`) }: own } = o;`, (adapter, prog, lbl) => {
    const plan = planOf(adapter, prog);
    check(`${ lbl }: distinct properties/${ name }`, plan?.length, 2);
    check(`${ lbl }: Symbol slot/${ name }`, plan?.[0]?.wks, name);
    check(`${ lbl }: actual string/${ name }`, plan?.[1]?.wks, null);
  });

// an effect-bearing computed key carries no source spelling either - the literal holds the
// resolved name and the effect stays on the pattern
runBoth('plan/se key drops its source spelling', 'const { [(eff(), "from")]: f } = o;', (adapter, prog, lbl) => {
  const plan = planOf(adapter, prog);
  check(`${ lbl } lookup`, plan?.[0]?.lookupKey, 'from');
  check(`${ lbl } source key`, plan?.[0]?.keyNode, null);
});

// the SPELLED slot and the FOLDED one part company on exactly one axis: a key that evaluates
// something. every consumer that CONSUMES a prop asks the spelled namer, so the fold may not
// answer there - the effect would leave with the key
check('spelled/identifier key', spelledSlotName(prop({ type: 'Identifier', name: 'from' }, false)), 'from');
check('spelled/string key', spelledSlotName(prop({ type: 'StringLiteral', value: 'from' }, false)), 'from');
check('spelled/numeric key', spelledSlotName(prop({ type: 'NumericLiteral', value: 0 }, false)), '0');
check('spelled/computed string key', spelledSlotName(prop({ type: 'StringLiteral', value: 'from' }, true)), 'from');
check('spelled/computed identifier key', spelledSlotName(prop({ type: 'Identifier', name: 'k' }, true)), null);
check('spelled/computed wks key', spelledSlotName(prop(member('Symbol', 'iterator'), true)), null);
check('spelled/se-folding key', spelledSlotName(prop(sequenceKey('from'), true)), null);
check('folded/se-folding key', synthSlotName(prop(sequenceKey('from'), true)), 'from');

// a REST prop has no slot to render - the whole plan declines
runBoth('plan/rest declines', 'const { at, ...r } = o;', (adapter, prog, lbl) => {
  check(lbl, planOf(adapter, prog), null);
});

// A head that binds existing names cannot relocate. Its mirror keeps the symbol slot
// beside the static, while an unknown key still prevents replacing the receiver.
for (const [key, prelude, expected] of [
  ['Symbol.toStringTag', '', true],
  ['tagKey', 'const tagKey = Symbol.toStringTag;', true],
  ['Symbol.iterator', '', true],
  ['unknown', '', false],
  ['(effect(), Symbol.toStringTag)', '', false],
  ['Symbol.toStringTag', 'const Symbol = source;', false],
]) runBoth(`head mirror/${ key }/${ prelude }`,
  `${ prelude } let tag, of; for ({ [${ key }]: tag, of } of [Array]) {}`,
  (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
    const plan = buildNestedParamSynthPlan({
      leafPatternPath, adapter: keyAdapter, meta: { object: 'Array', key: 'of', placement: 'static' },
      resolvePure(meta) {
        return meta.kind === 'property' && (meta.object === 'Symbol' || (meta.object === 'Array' && meta.key === 'of'))
          ? { kind: 'static', entry: `${ meta.object }/${ meta.key }`, hintName: meta.key } : null;
      },
    });
    check(label, !!plan?.targets?.length, expected);
  });

for (const [receiver, aliases, targets] of [
  ['flag ? globalThis : self', 1, 2],
  ['flag ? globalThis : custom', 0, 1],
]) runBoth(`mirror/static binding agreement/${ receiver }`,
  `let of; ({ Array: { of } } = ${ receiver });`, (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
    const plan = buildNestedParamSynthPlan({
      leafPatternPath, adapter: keyAdapter, meta: { object: 'globalThis', key: 'Array', placement: 'static', fromFallback: true },
      resolvePure: meta => meta.object === 'Array' && meta.key === 'of'
        ? { kind: 'static', entry: 'array/of', hintName: 'Array$of' } : null,
    });
    check(`${ label } targets`, plan?.targets?.length, targets);
    check(`${ label } agreed aliases`, plan?.staticBindings?.length, aliases);
  });

for (const defaulted of [false, true]) runBoth(`mirror/descended instance beside static/${ defaulted }`,
  `let flat, of; ({ Array: { prototype: { flat ${ defaulted ? '= fallback' : '' } }, of } } = globalThis);`,
  (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
    const plan = buildNestedParamSynthPlan({
      leafPatternPath, adapter: keyAdapter, meta: { object: 'globalThis', key: 'Array', placement: 'static' },
      resolvePure(meta) {
        if (meta.object === 'Array' && meta.key === 'of') return { kind: 'static', entry: 'array/of', hintName: 'Array$of' };
        if (meta.key === 'flat') return { kind: 'instance', entry: 'array/instance/flat', hintName: 'flatMaybeArray' };
        return null;
      },
    });
    const array = plan?.targets?.[0]?.tree.entries.find(item => item.key === 'Array')?.child;
    check(`${ label } keeps the descended claim`, array?.entries.find(item => item.key === 'prototype')?.child.kind,
      'descended-pattern');
  });

for (const [receiver, coerces] of [['globalThis', false], ['globalThis.window?.self', true]]) {
  runBoth(`mirror/receiver coercion/${ receiver }`, `const { Array: { from } } = ${ receiver };`,
    (parser, program, label) => {
      const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
      const plan = buildNestedParamSynthPlan({
        leafPatternPath, adapter: keyAdapter, meta: { object: 'globalThis', key: 'Array', placement: 'static' },
        resolvePure: meta => meta.object === 'Array' && meta.key === 'from'
          ? { kind: 'static', entry: 'array/from', hintName: 'Array$from' } : null,
      });
      check(`${ label } planned`, !!plan?.targets?.length, true);
      check(`${ label } coerces before pattern keys`, !!plan?.targets?.[0]?.coerceReceiver, coerces);
    });
}

for (const [name, key, expected] of [['Promise', 'all', 'polyfill'], ['Array', 'from', undefined]]) {
  runBoth(`mirror/constructor rest default/${ name }`, `function f({ ${ key }, ...rest } = ${ name }) {}`,
    (parser, program, label) => {
      const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
      const plan = buildNestedParamSynthPlan({
        leafPatternPath, adapter: keyAdapter, meta: { object: name, key, placement: 'static' },
        resolvePure(meta) {
          if (meta.kind === 'global' && meta.name === name) return { entry: name.toLowerCase(), hintName: name };
          if (meta.object === name && meta.key === key) return { kind: 'static', entry: `${ name.toLowerCase() }/${ key }` };
          return null;
        },
      });
      check(`${ label } whole default`, plan?.targets?.[0]?.tree.kind, expected);
      if (expected) check(`${ label } served property`, plan.targets[0].tree.readProperties.length, 1);
    });
}

runBoth('mirror/constructor rest with an effectful default stays on its index',
  'function f({ all, ...rest } = globalThis[(effect(), "self")].Promise) {} f();', (parser, program, label) => {
    const plan = buildNestedParamSynthPlan({
      leafPatternPath: parser.pickPath(program, 'ObjectPattern'), adapter: keyAdapter,
      meta: { object: 'Promise', key: 'all', placement: 'static' },
      resolvePure: meta => meta.kind === 'global' && meta.name === 'Promise'
        ? { entry: 'promise', hintName: 'Promise' } : null,
    });
    check(`${ label } no body extraction`, plan?.bail, true);
  });

// ... while a CALL in that slot keeps running ahead of the literal that stands in for its value, the
// declarator's own shape - and reproduces no throw: the slot fires only on the omitted argument
runBoth('mirror/constructor rest with a call default keeps the call ahead of its index',
  'const mk = () => Promise; function f({ all, ...rest } = mk()) {} f();', (parser, program, label) => {
    const plan = buildNestedParamSynthPlan({
      leafPatternPath: parser.pickPath(program, 'ObjectPattern'),
      adapter: keyAdapter,
      meta: { object: 'Promise', key: 'all', placement: 'static' },
      resolvePure: meta => meta.kind === 'global' && meta.name === 'Promise'
        ? { entry: 'promise', hintName: 'Promise' } : null,
    });
    check(`${ label } whole default`, plan?.targets?.[0]?.tree.kind, 'polyfill');
    check(`${ label } call kept ahead`, plan?.targets?.[0]?.keepPrefix, true);
    check(`${ label } no coercion`, plan?.targets?.[0]?.coerceReceiver, undefined);
  });

// One native slot consumes a call directly; several native slots share a capture. The call
// stays at its source evaluation point, including defaults and literal loop elements.
for (const [name, source] of [
  ['for-of head', 'const mk = () => ({ p: Promise, z: 1 }); for (const { p: { all }, z } of [mk()]) use(all, z);'],
  ['parameter default', 'const mk = () => ({ p: Promise, z: 1 }); function f({ p: { all }, z } = mk()) {} f();'],
]) runBoth(`mirror/call with one native slot/${ name }`, source, (parser, program, label) => {
  const plan = buildNestedParamSynthPlan({
    leafPatternPath: parser.pickPath(program, 'ObjectPattern', path => path.node.properties[0]?.key?.name === 'all'),
    adapter: keyAdapter,
    meta: { object: 'Promise', key: 'all', placement: 'static' },
    resolvePure: meta => meta.object === 'Promise' && meta.key === 'all'
      ? { kind: 'static', entry: 'promise/all', hintName: 'Promise$all' } : null,
  });
  const target = plan?.targets?.[0];
  checkTruthy(`${ label } planned`, target);
  check(`${ label } no receiver copy`, target?.memo, undefined);
  check(`${ label } no duplicated prefix`, target?.keepPrefix, undefined);
  check(`${ label } source call held by native slot`, target?.receiverNode, target?.node);
  if (!target) return;
  const rendered = renderSynthTree(target.tree, { injectImport: (entry, hintName) => hintName, receiverNode: target.receiverNode });
  const nativeRead = rendered.properties.find(property => property.key.name === 'z').value;
  check(`${ label } call stays in native read`, nativeRead.object, target.node);
});

for (const [fields, memo] of [['z, tail', true], ['z', false], ['["with-dash"]: z', false]]) runBoth(`mirror/call native slot count/${ fields }`,
  `const mk = () => ({ p: Promise, z: 1, tail: 2, "with-dash": 3 }); function f({ p: { all }, ${ fields } } = mk()) {} f();`,
  (parser, program, label) => {
    const plan = buildNestedParamSynthPlan({
      leafPatternPath: parser.pickPath(program, 'ObjectPattern', path => path.node.properties[0]?.key?.name === 'all'),
      adapter: keyAdapter,
      meta: { object: 'Promise', key: 'all', placement: 'static' },
      resolvePure: meta => meta.object === 'Promise' && meta.key === 'all'
        ? { kind: 'static', entry: 'promise/all', hintName: 'Promise$all' } : null,
    });
    checkTruthy(`${ label } planned`, plan?.targets?.[0]);
    check(`${ label } receiver capture`, !!plan?.targets?.[0]?.memo, memo);
    check(`${ label } whole call prefix`, !!plan?.targets?.[0]?.keepPrefix, memo);
  });

for (const fields of ['[(hit(), "p")]: { all }, z', 'p: { all }, missing = hit(), z']) {
  runBoth(`mirror/call keeps preceding pattern effects/${ fields }`,
    `const mk = () => ({ p: Promise, z: 1 }); function f({ ${ fields } } = mk()) {} f();`,
    (parser, program, label) => {
      const plan = buildNestedParamSynthPlan({
        leafPatternPath: parser.pickPath(program, 'ObjectPattern', path => path.node.properties[0]?.key?.name === 'all'),
        adapter: keyAdapter,
        meta: { object: 'Promise', key: 'all', placement: 'static' },
        resolvePure: meta => meta.object === 'Promise' && meta.key === 'all'
          ? { kind: 'static', entry: 'promise/all', hintName: 'Promise$all' } : null,
      });
      check(`${ label } no inline call past source effects`, plan?.targets?.some(target => !!target.receiverNode) ?? false, false);
    });
}

// Quiet source names and erased declarations follow the same scoped identifier proof.
for (const [prefix, reusable] of [['', true], ['declare const source: unknown;', true], ['const source = {};', true]]) {
  runBoth(`mirror/scoped receiver read/${ prefix }`, `${ prefix } use(source);`, (parser, program, label) => {
    const path = parser.pickPath(program, 'Identifier', item => item.node.name === 'source'
      && item.parentPath?.node?.type === 'CallExpression');
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    check(label, isReReferenceableAcrossReads(path.node, { scope: path.scope, adapter, path }), reusable);
  });
}

for (const [prefix, expectedMemo] of [['', false], ['const source = {};', false]]) {
  runBoth(`mirror/array shares its original receiver/${ prefix }`,
    `${ prefix } const [{ at, includes }] = [source];`, (parser, program, label) => {
      const arrayPath = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.type === 'ArrayPattern');
      const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
      const plan = buildNestedDestructurePlan({
        arrayPath,
        adapter,
        resolvePure: meta => ['at', 'includes'].includes(meta.key)
          ? { kind: 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key } : null,
      });
      checkTruthy(`${ label } paired plan`, plan?.array);
      check(`${ label } receiver shared before native method getters`, !!plan?.array.memos?.length, expectedMemo);
    });
}

runBoth('mirror/array single nested leaf reads its unbound receiver once',
  'const [{ y: { at } }] = [source];', (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.type === 'ArrayPattern');
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const plan = buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'actual/instance/at', hintName: 'at' } : null,
    });
    checkTruthy(`${ label } direct reading plan`, plan?.array);
    check(`${ label } no duplicated receiver needs capture`, !!plan?.array.capture, false);
    check(`${ label } source member read is carried`, plan?.extractions?.[0]?.receiver?.object?.name, 'source');
  });

runBoth('mirror/array preserves the initial name read before its effectful neighbour',
  'const [{ w: { values }, y: { at } }] = [source, effect()];', (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.type === 'ArrayPattern');
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const plan = buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: meta => ['values', 'at'].includes(meta.key)
        ? { kind: 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key } : null,
    });
    checkTruthy(`${ label } compact plan`, plan?.array);
    check(`${ label } source name needs no capture`, !!plan?.array.capture, false);
    checkDeep(`${ label } initial read and RHS effect stay ordered`, plan?.array.discarded?.map(node => node.type), ['Identifier', 'CallExpression']);
    check(`${ label } initial source read retained`, plan?.array.discarded?.[0], arrayPath.node.init.elements[0]);
    check(`${ label } original RHS effect retained`, plan?.array.discarded?.[1], arrayPath.node.init.elements[1]);
  });

// Captured ordinary leaves have one method Get, even when the enclosing source keeps
// native spread, iteration or coercion. Siblings, defaults and symbol reads retain theirs.
for (const [fields, entry, capture, expected] of [
  ['at', 'array/instance/at', true, true],
  ['["at"]: at', 'array/instance/at', true, true],
  ['at', 'array/instance/at', false, false],
  ['at = fallback()', 'array/instance/at', true, false],
  ['at, includes', 'array/instance/at', true, false],
  ['at, ...rest', 'array/instance/at', true, false],
  ['[Symbol.iterator]: method', 'get-iterator-method', true, false],
  ['[(effect(), "at")]: at', 'array/instance/at', true, false],
]) runBoth(`mirror/captured leaf read ownership/${ fields }/${ capture }`,
  `const { w: { ${ fields } } } = { ...source, w: [1] };`, (parser, program, label) => {
    const patternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties[0]?.key?.name !== 'w');
    const [leaf] = patternPath.node.properties;
    const literal = parser.pickPath(program, 'ArrayExpression').node;
    const plan = planSideEffectKeyStrategy({
      polyfillKind: 'instance',
      entry,
      prop: leaf,
      pattern: patternPath.node,
      hostPattern: parser.pickPath(program, 'VariableDeclarator').node.id,
      sourceBindingCount: 1,
      receiverNode: { type: 'Identifier', name: 'captured' },
      capturedReceiverNode: capture ? literal : null,
      propKeyIsPure: fields !== '[(effect(), "at")]: at',
    });
    check(`${ label } source wrapper retained`, plan?.eliminateResidual, false);
    check(`${ label } one ordinary Get owned by dispatcher`, plan?.consumeResidualRead, expected);
  });

runBoth('mirror/current literal capture owns its method Get',
  'const { w: { at } } = { ...source, w: [1] };', (parser, program, label) => {
    const patternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties[0]?.key?.name === 'at');
    const literal = parser.pickPath(program, 'ArrayExpression').node;
    const plan = planSideEffectKeyStrategy({
      polyfillKind: 'instance',
      entry: 'array/instance/at',
      receiverNode: literal,
      prop: patternPath.node.properties[0],
      pattern: patternPath.node,
      hostPattern: parser.pickPath(program, 'VariableDeclarator').node.id,
      sourceBindingCount: 1,
    });
    check(`${ label } allocator captures literal before both readers`, plan.memoizeReceiver, true);
    check(`${ label } native leaf read is spent`, plan.consumeResidualRead, true);
  });

for (const fields of ['w: { at }, z: {}', 'w: { at }, ...rest', 'before: {}, w: { at }']) {
  runBoth(`mirror/captured leaf cannot cross native siblings/${ fields }`,
    `const { ${ fields } } = { ...source, w: [1] };`, (parser, program, label) => {
      const patternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties[0]?.key?.name === 'at');
      const plan = planSideEffectKeyStrategy({
        polyfillKind: 'instance',
        entry: 'array/instance/at',
        prop: patternPath.node.properties[0],
        pattern: patternPath.node,
        hostPattern: parser.pickPath(program, 'VariableDeclarator').node.id,
        sourceBindingCount: 1,
        receiverNode: { type: 'Identifier', name: 'captured' },
        capturedReceiverNode: parser.pickPath(program, 'ArrayExpression').node,
      });
      check(`${ label } native sibling keeps method read in its slot`, plan.consumeResidualRead, false);
    });
}

runBoth('mirror/earlier extracted binding does not make a source host sole',
  'const { w: { at } } = { ...source, w: [1] };', (parser, program, label) => {
    const patternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties[0]?.key?.name === 'at');
    const plan = planSideEffectKeyStrategy({
      polyfillKind: 'instance',
      entry: 'array/instance/at',
      prop: patternPath.node.properties[0],
      pattern: patternPath.node,
      hostPattern: parser.pickPath(program, 'VariableDeclarator').node.id,
      sourceBindingCount: 2,
      receiverNode: { type: 'Identifier', name: 'captured' },
      capturedReceiverNode: parser.pickPath(program, 'ArrayExpression').node,
    });
    check(`${ label } original binding count still constrains the handoff`, plan.consumeResidualRead, false);
  });

for (const [pattern, entry, inline] of [
  ['{ y: { at } }', 'instance/at', false],
  ['{ y: { at }, other }', 'instance/at', true],
  ['{ y: { at = fallback() }, other }', 'instance/at', false],
  ['{ y: { at, includes }, other }', 'instance/at', false],
  ['{ y: { ["at"]: at }, other }', 'instance/at', false],
  ['{ ["y"]: { at }, other }', 'instance/at', false],
  ['{ y: { at } = fallback(), other }', 'instance/at', false],
  ['{ y: { at, ...rest }, other }', 'instance/at', false],
  ['{ y: { at }, other }', 'get-iterator-method', false],
]) runBoth(`mirror/ordered singleton receiver forwarding/${ pattern }/${ entry }`,
  `let at, includes, other, rest; (${ pattern } = source);`, (parser, program, label) => {
    const assignment = parser.pickPath(program, 'AssignmentExpression');
    const patternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties[0]?.key?.name === 'at'
      || path.node.properties[0]?.computed && path.node.properties[0]?.value?.name === 'at');
    const [claim] = patternPath.node.properties;
    const plan = planNestedKeyedPatternCapture({
      pattern: assignment.node.left,
      init: assignment.node.right,
      ancestors: assignment.node.left.properties.length > 1
        ? [{ pattern: assignment.node.left, prop: assignment.node.left.properties[0], defaultValue: null }]
        : null,
      force: true,
      plansLeaf: true,
      prop: claim,
      kind: 'instance',
      entry,
    });
    check(`${ label } only a final ordinary single read can forward`, !!plan?.inlineLeaf, inline);
  });

// a NAME bound to a call yielding a container is a static root of the mirror, as a name bound to
// the literal is: the keys descend the receiver walk's alias and call arms, the read of the name is
// what the mirror replaces
runBoth('mirror/alias of a call is a static root', 'const mk = () => ({ p: Promise }); const w = mk(); for (const { p: { all } } of [w]) use(all);',
  (parser, program, label) => {
    // the walk dereferences the name, which asks the adapter's binding-type channel: the real one
    const adapter = parser.name === 'babel' ? createBabelAdapter({ method: 'usage-pure' }) : createEstreeAdapter({ method: 'usage-pure' });
    const plan = buildNestedParamSynthPlan({
      leafPatternPath: parser.pickPath(program, 'ObjectPattern', path => path.node.properties[0]?.key?.name === 'all'),
      adapter,
      meta: { object: 'Promise', key: 'all', placement: 'static' },
      resolvePure: meta => meta.object === 'Promise' && meta.key === 'all'
        ? { kind: 'static', entry: 'promise/all', hintName: 'Promise$all' } : null,
    });
    check(`${ label } planned`, plan?.targets?.length, 1);
    check(`${ label } replaces the name`, plan?.targets?.[0]?.node?.name, 'w');
  });

// A simple mirror must not evaluate a native sibling before an effectful key.
for (const [fields, allowed] of [
  ['at, "with-dash": other', true],
  ['at, [(hit(), "with-dash")]: other', false],
  ['[(hit(), "at")]: at', true],
]) runBoth(`instance mirror native read order/${ fields }`, `function read({ ${ fields } } = [1]) {}`,
  (parser, program, label) => {
    const assignment = parser.pickPath(program, 'AssignmentPattern');
    check(label, paramDefaultInstanceSynthAllowed({
      objectPatternNode: assignment.node.left,
      receiverNode: assignment.node.right,
      scope: assignment.scope,
      path: assignment,
      adapter: keyAdapter,
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at', hintName: 'at' } : null,
    }), allowed);
  });

finish();
