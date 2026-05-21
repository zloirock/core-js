// substTypeRefAsType reached a dotted TSQualifiedName ref (`NS.Foo<T>`) during typeparam
// subst by using only the first segment as the lookup name - `NS` was not a type, the
// fallback chain returned null, and `Wrap<string>` resolved to undecidable. fixture
// drives the joined-segments path: namespace-internal generic body is substituted
// through to its element type so `.at()` narrows to the array-specialised polyfill
declare namespace NS {
  type Foo<T> = T[];
}
type Wrap<T> = NS.Foo<T>;
declare const r: Wrap<string>;
r.at(0);
