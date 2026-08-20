// `function f(Map) { Map ||= 1 }` - the parameter `Map` shadows the global. compound LHS
// detection routes through Identifier visitor which gates on `adapter.hasBinding`; the
// parameter binding is found, so no polyfill emission for this local variable
function f(Map) {
  Map ||= 1;
  return Map;
}
f({});