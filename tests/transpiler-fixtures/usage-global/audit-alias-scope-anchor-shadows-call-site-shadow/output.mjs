import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A value resolved through an alias walk is spelled where the ALIAS lives, so its identifiers re-anchor in the alias's own
// declaration scope - a use-site shadow of a name the value reads must not capture it.

// an inline-callee's returned body resolves in the callee's scope, not at the call site
const factory = () => Array;
export function callSiteShadow(Array) {
  return factory().from([1, 2]);
}