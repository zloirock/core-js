import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
// A constructor navigation used as a parameter default supplies an instance slot.
// The synth runs only for the omitted argument; a caller's own name stays visible.
export function read({
  name
} = globalThis.Symbol) {
  return name;
}
export const supplied = read({
  name: 'caller'
});