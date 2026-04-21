// conditional with `infer` clause — plugin doesn't implement infer; should
// resolve trueBranch/falseBranch via resolveTypeAnnotation and skip if they
// reference the inferred name.
type Inner<T> = T extends (infer U)[] ? U : never;
declare const u: Inner<string[]>;
u.includes('a');
