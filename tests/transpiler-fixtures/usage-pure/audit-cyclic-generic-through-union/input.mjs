// self-wrap inside a union branch: `Tree<T> = T | Tree<T[]>`. union fold must
// substitute each member with seen-threaded context so the recursive branch hits
// the decl-guard. valid trees (with T terminating) would need explicit depth-bound
// recursion; this test just verifies the plugin doesn't hang on pathological form
type Tree<T> = T | Tree<T[]>;
declare const t: Tree<string>;
t.at(0);
