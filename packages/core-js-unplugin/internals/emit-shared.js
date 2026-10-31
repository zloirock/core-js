import { cloneNode, sequenceExpression } from '@core-js/polyfill-provider/render';
import { brand } from '@core-js/polyfill-provider/helpers/error-tag';

// helpers shared by the AST engine's emitters (usage-pure and the destructure pipeline) -
// they live outside both so neither imports the other

export { receiverContainsOptional as receiverCarriesOptional } from '@core-js/polyfill-provider/helpers/ast-patterns';

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

// Replace a node only through native AST nodes and arrays, retaining its source span.
// Emit plans hand nodes, not paths, so find the parent slot by identity from the root.
// Throw on an over-deep graph: returning false would claim the target is absent and
// let a caller emit statements around a replacement that never happened.
export function replaceNodeInTree(root, target, next, depth = 0) {
  if (depth >= 1024) {
    throw new TypeError(brand('replaceNodeInTree: object graph deeper than the walk supports (cycle, or a non-AST graph)'));
  }
  if (Array.isArray(root)) {
    const at = root.indexOf(target);
    if (at !== -1) {
      root[at] = next;
      return true;
    }
    return root.some(item => replaceNodeInTree(item, target, next, depth + 1));
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
    if (value && typeof value === 'object' && replaceNodeInTree(value, target, next, depth + 1)) return true;
  }
  return false;
}

export { mintedProxyGlobalName } from '@core-js/polyfill-provider/detect-usage/guard-preparation';

// SE wrap: `(se1, se2, leaf)` - the sequence spelling both legs share
export function withSideEffects(leaf, effects) {
  return effects?.length ? sequenceExpression([...effects.map(effect => cloneNode(effect)), leaf]) : leaf;
}
