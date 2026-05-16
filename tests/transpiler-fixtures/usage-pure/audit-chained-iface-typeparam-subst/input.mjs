// chained interface inheritance: `Outer<T> extends Mid<T>` and `Mid<U> extends Array<U>`.
// resolveUserTypeElement recurses through each link; each step rebuilds its substMap from
// the local decl's params + the propagated arg from the previous step. without subst at
// each hop, `T` from Outer wouldn't reach `U` in Mid wouldn't reach Array's slot.
interface Mid<U> extends Array<U> {}
interface Outer<T> extends Mid<T> {}
declare const x: any;
const [first]: Outer<string> = x;
first.at(0);
