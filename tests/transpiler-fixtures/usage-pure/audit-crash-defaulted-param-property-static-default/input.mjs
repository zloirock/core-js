// usage-pure constructor parameter-property with a default whose initializer is a polyfillable
// static (`constructor(private items = Array.from(...))`): the defaulted parameter-property parses
// as TSParameterProperty wrapping an AssignmentPattern, which crashed estree-toolkit's scope crawl
// before any transform. the default initializer must still be substituted. regression lock
class C {
  constructor(private items = Array.from([1, 2, 3])) {}
}
[C];
