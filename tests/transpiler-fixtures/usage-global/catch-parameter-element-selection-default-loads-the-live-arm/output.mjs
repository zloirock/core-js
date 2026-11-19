import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a catch parameter binds a value no host spells, so an element's default alone names the receiver:
// usage-global loads the statics of the live operand of a selection the build decides there, and none of
// the dead operand's
export function viaDecidedElement(g) {
  try {
    g();
  } catch ([{
    of
  } = typeof Symbol != 'undefined' ? Array : Set]) {
    return of;
  }
}