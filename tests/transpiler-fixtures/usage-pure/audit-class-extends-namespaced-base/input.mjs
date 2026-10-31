// `class Sub extends NS.Base` resolved as a TYPE (not via member-access). the extends-clause name
// resolution walks runtime bindings only - TS-only `namespace NS { export class Base extends Array<X> }`
// has no runtime binding and the chain to Array<X> was lost when resolving Sub through
// the type-param substitution (Wrap<T>=T pass-through). added segments + a type-declaration lookup
// fallback so Sub -> NS.Base -> Array<string> chain reaches the array polyfill dispatch
namespace NS {
  export class Base extends Array<string> {}
}
class Sub extends NS.Base {}
type Wrap<T> = T;
declare const r: Wrap<Sub>;
r.at(0);
