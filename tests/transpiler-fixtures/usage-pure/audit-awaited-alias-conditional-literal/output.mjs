import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
// Conditional with literal-literal check sides ('narrow' extends 'narrow') goes through
// pickAwaitedConditionalBranch's AST-level pickConditionalBranchByAST first - preserves
// literal precision before falling to resolved-type pickConditionalBranch. Probes that
// AST-pick fires unambiguously so the literal narrowing path doesn't widen prematurely
type Tag<K> = K extends 'arr' ? Promise<number[]> : Promise<string[]>;
type AliasTag<K> = Tag<K>;
declare const v: Awaited<AliasTag<'arr'>>;
_atMaybeArray(v).call(v, 0);
_findIndexMaybeArray(v).call(v, x => true);