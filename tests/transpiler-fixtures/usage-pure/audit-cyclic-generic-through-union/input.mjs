// self-wrap inside a union branch: `Tree<T> = T | Tree<T[]>`. union fold must
// substitute each member with seen-threaded context so the recursive branch hits
// the decl-guard. valid trees (with T terminating) would need explicit depth-bound
// recursion; this test just verifies the plugin doesn't hang on pathological form
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
type Tree<T> = T | Tree<T[]>;
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
declare const t: Tree<string>;
t.at(0);
