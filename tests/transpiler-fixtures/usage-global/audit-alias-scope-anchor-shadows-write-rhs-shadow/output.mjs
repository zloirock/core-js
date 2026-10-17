import "core-js/modules/es.string.from-code-point";
// a reassigned alias's write RHS resolves in the binding's scope, not at the use site
let holder = Object;
holder = String;
export function writeRhsShadow(String) {
  return holder.fromCodePoint(99);
}