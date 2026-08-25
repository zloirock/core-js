import { computedKeyIsWellKnownSymbol } from '@core-js/polyfill-provider/detect-usage/resolve';
import { computedKeysAllBound } from '@core-js/polyfill-provider/helpers/ast-patterns';

// babel-plugin: computed-key synth-swap safety gate. a computed key is safe to mirror into a synth
// literal (`[k]: _polyfill` / `[k]: receiver[k]`) when it resolves to a STABLE in-scope value: a user
// local (`const k = 'of'`), a genuine user import, or a WELL-KNOWN-SYMBOL key (spelled
// `[Symbol.iterator]` or through the pure import this emitter already minted for it - the shared
// fold answers for both spellings, so the two emitters agree however their rewrite order left it).
// UNSAFE when a computed key has no binding and folds to no symbol: a bare global like `[Set]`
// ReferenceErrors on the target when emitted raw. that half is the provider rule
// (`computedKeysAllBound`) shared with unplugin
export function patternComputedKeysSynthSafe({ objectPatternNode, scope, adapter, path }) {
  return computedKeysAllBound(objectPatternNode, scope,
    keyNode => computedKeyIsWellKnownSymbol({ keyNode, scope, adapter, path }));
}
