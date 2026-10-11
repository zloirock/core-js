import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.values";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// an alias reads its source where it is declared, so a `var` of the same name in a block of a function the
// use stands in shadows no read the type of a value through the alias asks either: what a static returns off
// a realm alias, off a constructor destructured from an alias, off a constructor destructured from a realm alias
const g = self;
export function realm(c) {
  if (c) {
    var self = 1;
  }
  return g.Array.of(1).at(0);
}
const D = Object;
export function destructuredStatic(c) {
  if (c) {
    var Object = 1;
  }
  const {
    values
  } = D;
  return values(o).includes(1);
}
const h = globalThis;
export function realmDestructured(c) {
  if (c) {
    var globalThis = 1;
  }
  const {
    Array: A
  } = h;
  return A.from(o).values();
}