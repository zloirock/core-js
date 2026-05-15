// bare-name type lookup at program scope must NOT descend into nested
// `namespace N { ... }` bodies - that would violate TS lexical scoping. here `Box`
// is defined ONLY inside `N`, so the bare `Box` annotation on `x` is unresolved.
// the resolver bails to common dispatch on `.at(0)`, emitting BOTH array and string
// polyfills. without this scoping rule the walker would promiscuously pick `N.Box`,
// resolve `x.items` as `string`, and emit only `string.at` - missing the array case
namespace N {
  interface Box {
    items: string;
  }
}
declare const x: Box;
x.items.at(0);
