import { getEntrySource } from '@core-js/polyfill-provider/detect-usage/entries';
import { declaresRequireBinding, resolveBatchDirectivePromotionPolicy } from '@core-js/polyfill-provider/helpers/ast-patterns';

// entry-global mode, the DECISION half: which top-level `import 'core-js/...'` /
// `require('core-js/...')` statements resolve to module sets, and what disposition each
// slot gets. partitioned in two passes so the batch sees every candidate before any commit
// (mirrors babel-plugin's traversal where programExit alters the live body per visitor -
// the simulation here closes that gap). `entry.js` applies the returned plan by
// splicing the body
export function planEntries(ast, { adapter, getCoreJSEntry, injectModulesForEntry, isDisabled }) {
  // getEntrySource only consults `hasBinding('require')`; stub-scope is enough
  const shadowScope = declaresRequireBinding(ast.body) ? { hasBinding: () => true } : null;

  // pass 1: collect candidate body indices, inject modules eagerly (the per-entry module
  // set is identical whether the slot ends up removed or replaced by `0;`)
  const candidateIndices = [];
  let injectedModules = 0;
  for (let idx = 0; idx < ast.body.length; idx++) {
    const node = ast.body[idx];
    const source = getEntrySource(node, adapter, shadowScope);
    if (source === null || isDisabled(node)) continue;
    const entry = getCoreJSEntry(source);
    if (entry === null) continue;
    injectedModules += injectModulesForEntry(entry);
    candidateIndices.push(idx);
  }

  // pass 2: right-to-left simulated walk decides which slots stay as `0;` directive
  // terminators (see `resolveBatchDirectivePromotionPolicy` docstring)
  const { toRemove, toReplaceWithNoop } = resolveBatchDirectivePromotionPolicy({
    body: ast.body,
    candidateIndices,
    // a non-empty injected module block lands after the prologue and blocks promotion
    // for every removed entry - the `0;` placeholder matters only for zero-module files
    injectedImportsBreakPrologue: injectedModules > 0,
  });
  return { toRemove, toReplaceWithNoop, found: toRemove.length + toReplaceWithNoop.length > 0 };
}
