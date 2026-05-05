// Conditional with literal-literal check sides ('narrow' extends 'narrow') goes through
// pickAwaitedConditionalBranch's AST-level pickConditionalBranchByAST first - preserves
// literal precision before falling to resolved-type pickConditionalBranch. Probes that
// AST-pick fires unambiguously so the literal narrowing path doesn't widen prematurely
type Tag<K> = K extends 'arr' ? Promise<number[]> : Promise<string[]>;
type AliasTag<K> = Tag<K>;
declare const v: Awaited<AliasTag<'arr'>>;
v.at(0);
v.findIndex(x => true);
