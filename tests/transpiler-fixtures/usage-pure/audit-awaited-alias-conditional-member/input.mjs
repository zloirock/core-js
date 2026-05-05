// Member-access flow parallel to audit-awaited-alias-conditional-body: receiver is an
// Awaited<> wrapper around a multi-hop alias whose body is a conditional that resolves
// to an object literal containing arrays. peelAwaitedArgument must pick the firing branch
// (resolved-type pickConditionalBranch on disjoint primitives) so findTypeMember sees
// {items, tags} and resolves the array fields. without conditional handling, peelAwaitedArgument
// returns the conditional unchanged and findTypeMember's AST-only pick fails on
// non-literal check sides, dropping member-narrowing
type Cond<X> = X extends string ? never : { items: X[]; tags: string[] };
type Wrap<Y> = Cond<Y>;
declare const r: Awaited<Wrap<number>>;
r.items.at(0);
r.tags.includes('x');
