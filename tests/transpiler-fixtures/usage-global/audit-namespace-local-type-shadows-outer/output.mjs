import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// a namespace-local declaration SHADOWS an outer namesake, and the reverse case has to keep
// working in the same file: a value declared OUTSIDE keeps the outer declaration even when it is
// read from inside the namespace. both answers come from anchoring the name lookup at the
// declaration the annotation was written on, not at the site the value is used from
interface Inner {
  items: string;
}
declare const outside: Inner;
namespace NS {
  interface Inner {
    items: number[];
  }
  declare function make(): Inner;
  export function readParam(v: Inner) {
    return v.items.at(0);
  }
  export const fromAmbient = make().items.includes(1);
  export const fromOutside = outside.items.padStart(2);
}
export const r = [NS.readParam({
  items: [1]
}), NS.fromAmbient, NS.fromOutside];