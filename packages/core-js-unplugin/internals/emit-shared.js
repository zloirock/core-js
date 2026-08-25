import { POSSIBLE_GLOBAL_OBJECTS, TS_EXPR_WRAPPERS } from '@core-js/polyfill-provider/helpers/ast-patterns';
import { cloneNode, sequenceExpression } from './builders.js';
// the member-hop spelling and the proxy-receiver collapse are the render canon's, re-exported
// so this leg's emitters keep taking their node vocabulary from one import
export { memberFromKeyName, renderProxyReceiverPlan } from '@core-js/polyfill-provider/render';

// helpers shared by the AST engine's emitters (usage-pure and the destructure pipeline) -
// they live outside both so neither imports the other

// does any hop under this receiver carry a `?.` - sealed spellings included: the seal ends
// the CHAIN, but the short-circuit still makes the sealed VALUE undefinable
export function receiverCarriesOptional(node) {
  if (!node || typeof node !== 'object' || !node.type) return false;
  if ((node.type === 'MemberExpression' || node.type === 'CallExpression') && node.optional) return true;
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in node) {
    const value = node[key];
    if (Array.isArray(value)) {
      for (const item of value) if (receiverCarriesOptional(item)) return true;
    } else if (receiverCarriesOptional(value)) return true;
  }
  return false;
}

// a node DISCARDED as a non-tail SEQUENCE element: nobody reads the value it evaluates to, so a
// rewrite there is as free as one in statement position. transparent wrappers climb with it
export function discardedSequenceElement(path) {
  let cur = path;
  for (let up = cur?.parentPath; up?.node; up = cur.parentPath) {
    const { type } = up.node;
    if (type === 'SequenceExpression') return up.node.expressions.at(-1) !== cur.node;
    if (type !== 'ParenthesizedExpression' && !TS_EXPR_WRAPPERS.has(type)) return false;
    cur = up;
  }
  return false;
}

// swap `target` for `next` wherever it sits - the emit plans hand NODES, not paths, so the
// parent slot is found by identity from the given root
// a rebuilt spelling STANDS where its source stood: hand the printer that span through a
// side channel, so the sourcemap keeps the region a text splice would have kept. `start` /
// `end` themselves stay absent on minted nodes - `spellsSameSource` tells a clone from a
// mint by exactly that absence
export function stampReplacementSpan(next, source) {
  if (Number.isInteger(source?.start) && next && typeof next === 'object' && !Number.isInteger(next.start)) {
    next.replacedSpan ??= { start: source.start, end: source.end };
  }
  return next;
}

export function replaceNodeInTree(root, target, next) {
  if (Array.isArray(root)) {
    const at = root.indexOf(target);
    if (at !== -1) {
      root[at] = next;
      return true;
    }
    return root.some(item => replaceNodeInTree(item, target, next));
  }
  if (!root || typeof root !== 'object' || !root.type) return false;
  stampReplacementSpan(next, target);
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in root) {
    const value = root[key];
    if (value === target) {
      root[key] = next;
      return true;
    }
    if (value && typeof value === 'object' && replaceNodeInTree(value, target, next)) return true;
  }
  return false;
}

// peel the transparent wrappers an expression may wear (parens, chain, TS casts) down to the
// value-bearing node - the one peel both emitters read through
export function peelExpressionWrappers(node) {
  while (node && (node.type === 'ParenthesizedExpression' || node.type === 'ChainExpression'
    || TS_EXPR_WRAPPERS.has(node.type))) node = node.expression;
  return node;
}

// the VALUE a kept write stores: a bare proxy root or a spine whose LEAF hop has a pure
// entry spells one (`globalThis.self` -> `_self`); a window-terminated spine does not.
// `isSubstituted` answers for a root the walk ALREADY swapped - a drain-time caller reads the
// injected binding (`_globalThis`), whose name no longer resolves as a global
export function proxyStoreIsSpellable(storedNode, resolveGlobalPolyfill, isSubstituted = null) {
  // the stored VALUE is the sequence's tail - the prefix is effect, not surface. only a MEMBER
  // tail answers here: a bare IDENTIFIER tail may be an alias this helper cannot resolve, and the
  // caller's re-read canon owns that shape (`(s = (f++, g), g).WeakRef`)
  let value = peelExpressionWrappers(storedNode);
  while (value?.type === 'SequenceExpression'
    && peelExpressionWrappers(value.expressions.at(-1))?.type === 'MemberExpression') {
    value = peelExpressionWrappers(value.expressions.at(-1));
  }
  if (value?.type === 'Identifier') return !!resolveGlobalPolyfill(value.name) || !!isSubstituted?.(value.name);
  if (value?.type === 'MemberExpression' && !value.computed) return !!resolveGlobalPolyfill(value.property?.name);
  return true;
}

// the source-global NAME a minted pure import stands for (`_self` -> 'self'), through the
// injector's pure-import registry - null for anything else. the one reverse lookup both
// ast surfaces ask (a proxy-name check and the hint-name spelling were hand-kept twins)
export function mintedProxyGlobalName(name, injectorState) {
  const source = [...injectorState?.pureImports ?? []].find(([, minted]) => minted === name)?.[0];
  if (!source) return null;
  const tail = source.split('/').at(-1).replaceAll(/-(?<ch>[a-z])/g, (match, ch) => ch.toUpperCase());
  return POSSIBLE_GLOBAL_OBJECTS.has(tail) ? tail : null;
}

// SE wrap: `(se1, se2, leaf)` - the sequence spelling both legs share
export function withSideEffects(leaf, effects) {
  return effects?.length ? sequenceExpression([...effects.map(effect => cloneNode(effect)), leaf]) : leaf;
}
