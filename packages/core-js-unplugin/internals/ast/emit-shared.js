import { POSSIBLE_GLOBAL_OBJECTS, TS_EXPR_WRAPPERS, isValidIdentifierName } from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  cloneNode, identifier, literal, memberExpression, sequenceExpression,
} from './builders.js';

// helpers shared by the AST engine's emitters (usage-pure and the destructure pipeline) -
// they live outside both so neither imports the other

// does any hop under this receiver carry a `?.` - sealed spellings included: the seal ends
// the CHAIN, but the short-circuit still makes the sealed VALUE undefinable
export function receiverCarriesOptional(node) {
  if (!node || typeof node !== 'object' || !node.type) return false;
  if ((node.type === 'MemberExpression' || node.type === 'CallExpression') && node.optional) return true;
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      if (value.some(item => receiverCarriesOptional(item))) return true;
    } else if (receiverCarriesOptional(value)) return true;
  }
  return false;
}

// a member read spelled from a KEY NAME string: a name a plain member cannot carry
// (`'App-Key'`, `'A b'`) spells COMPUTED with its literal - `base.App-Key` parses as a
// subtraction and `base.A b` not at all
export function memberFromKeyName(object, keyName, options = {}) {
  return isValidIdentifierName(keyName)
    ? memberExpression(object, identifier(keyName), options)
    : memberExpression(object, literal(keyName), { ...options, computed: true });
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

// render a substrate-neutral proxy-receiver plan (from the shared `planProxyReceiver`)
// into collapsed AST - the babel emitter's twin: the decision lives in the provider, this
// only builds nodes. a `keep` / alias root is cloned - the clone re-visits, so its own
// proxy root still earns the pure rewrite there
export function renderProxyReceiverPlan(plan, injectPureImport) {
  if (plan.kind === 'member') {
    const inner = renderProxyReceiverPlan(plan.inner, injectPureImport);
    return inner ? memberExpression(inner, cloneNode(plan.property), { computed: plan.computed }) : null;
  }
  const keepOrAlias = plan.rootBinding.alias ?? plan.rootBinding.keep;
  const rootBinding = keepOrAlias ? cloneNode(keepOrAlias)
    : identifier(injectPureImport(plan.rootBinding.pure.entry, plan.rootBinding.pure.hintName));
  const rootNode = plan.harvestedSE.length
    ? sequenceExpression([...plan.harvestedSE.map(expr => cloneNode(expr)), rootBinding])
    : rootBinding;
  // dropped-hop KEY effects fold into the surviving leaf key - where the native order
  // evaluates them (after the root and its guard, before the read)
  const keyPrefix = plan.keyPrefixSE ?? [];
  const property = keyPrefix.length
    ? sequenceExpression([...keyPrefix.map(expr => cloneNode(expr)),
      plan.computed ? cloneNode(plan.property) : literal(plan.property.name)])
    : cloneNode(plan.property);
  const computed = plan.computed || keyPrefix.length > 0;
  return memberExpression(rootNode, property, { computed, optional: !!plan.optional });
}

// swap `target` for `next` wherever it sits - the emit plans hand NODES, not paths, so the
// parent slot is found by identity from the given root
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
  for (const [key, value] of Object.entries(root)) {
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
