// shadowed binding: `function f(Map) { Map ||= 1 }` - the parameter `Map` is a local
// binding, not the global. `isBound` short-circuits the warning at the call site;
// peel doesn't fire because the inner check rejects on `isBound`
function f(Map) {
  Map ||= 1;
  return Map;
}
f({});