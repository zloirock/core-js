// Self-referencing generic alias `type Self<T> = Self<T[]>` would loop forever expanding
// the body. followTypeAliasChain `visited` set keys on decl identity, so the second hop
// hits the same TSTypeAliasDeclaration and breaks the loop. Resolution terminates and
// falls back to generic dispatch
type Self<T> = Self<T[]>;
declare const v: Self<number>;
v.at(0);
v.includes(1);
