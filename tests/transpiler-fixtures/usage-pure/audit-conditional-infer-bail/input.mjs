// conditional type using an `infer` clause - plugin does not attempt to solve
// `infer` variables at the type level, so the receiver's type stays unresolved.
// `.includes` falls back to the generic instance-method polyfill
type Inner<T> = T extends (infer U)[] ? U : never;
declare const u: Inner<string[]>;
u.includes('a');
