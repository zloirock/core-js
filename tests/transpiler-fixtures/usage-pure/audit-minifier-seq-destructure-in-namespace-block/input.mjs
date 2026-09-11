// minifier-shape inside a TS `namespace NS {}` body (TSModuleBlock - separate Statement-list
// host from BlockStatement). namespaces aren't typical minifier output but the walker handles
// the type for symmetry. uses `.values` to keep the polyfill receiver distinct from siblings
let values;
namespace NS {
  (sideEffect(), ({ values } = Object));
}
NS.values({ a: 1 });
