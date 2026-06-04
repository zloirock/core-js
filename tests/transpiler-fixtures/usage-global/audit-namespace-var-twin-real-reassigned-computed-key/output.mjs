import "core-js/modules/es.array.of";
// a real program-scope `var` computed key reassigned before the use, colliding by name with a
// namespace-scoped `var` twin. the parser over-hoists the namespace twin and attributes it as a
// phantom reassignment of the real binding; scrubbing it lets the reaching value `'of'` resolve so
// the static polyfill is injected
var K = 'from';
K = 'of';
namespace N {
  var K: any;
}
Array[K]([1]);