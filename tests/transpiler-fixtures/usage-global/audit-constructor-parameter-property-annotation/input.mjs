// `TSParameterProperty` (constructor parameter property `public` / `private` / `readonly`)
// wraps the inner Identifier - the annotation walker must peel the wrapper to reach the
// declared `Map<...>` / `Set<...>` types, otherwise no polyfill is injected. no runtime
// `new Map()` / `new Set()` here on purpose, so the only way polyfills get pulled in is
// through the annotation walker descending into TSParameterProperty.parameter
class C {
  constructor(public m: Map<string, number>, private readonly s: Set<Date>) {}
}
[C];
