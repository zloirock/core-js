// inferred X declared in extendsType referenced backwards within same extendsType:
// outer X (if present in subst) must NOT capture the locally-bound X
type Wrap<U> = U extends [infer X, X] ? X[] : never;
declare const v: Wrap<[number, number]>;
v.at(0);
