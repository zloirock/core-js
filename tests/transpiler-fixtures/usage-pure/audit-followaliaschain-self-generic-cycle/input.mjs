// Self-referencing generic alias `type Self<T> = Self<T[]>` would loop forever expanding
// the body. followTypeAliasChain `visited` set keys on decl identity, so the second hop
// hits the same TSTypeAliasDeclaration and breaks the loop. Resolution terminates and
// falls back to generic dispatch
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
type Self<T> = Self<T[]>;
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
declare const v: Self<number>;
v.at(0);
v.includes(1);
