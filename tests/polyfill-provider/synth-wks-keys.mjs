// Decision tests for the WELL-KNOWN-SYMBOL key canon of the synth families: the shape
// recognizer and the slot it mints (both pure functions), and the scope-aware fold that
// answers which symbol a key names whatever spelling it wears - through both parsers,
// since the fold rides each parser's own binding + polyfill-hint channel
import {
  hasRealBinding,
  isReplayableSynthKey,
  isSynthSimpleObjectPattern,
  synthSwapPropKey,
  wksComputedKeyName,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { computedKeyWellKnownSymbolName } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { buildPatternRenderPlan } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { synthEntryKey } from '../../packages/core-js-polyfill-provider/render.js';
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

// an effect-bearing computed key carries no source spelling either - the literal holds the
// resolved name and the effect stays on the pattern
runBoth('plan/se key drops its source spelling', 'const { [(eff(), "from")]: f } = o;', (adapter, prog, lbl) => {
  const plan = planOf(adapter, prog);
  check(`${ lbl } lookup`, plan?.[0]?.lookupKey, 'from');
  check(`${ lbl } source key`, plan?.[0]?.keyNode, null);
});

// a REST prop has no slot to render - the whole plan declines
runBoth('plan/rest declines', 'const { at, ...r } = o;', (adapter, prog, lbl) => {
  check(lbl, planOf(adapter, prog), null);
});

finish();
