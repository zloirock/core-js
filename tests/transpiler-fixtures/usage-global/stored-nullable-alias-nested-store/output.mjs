import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A pattern still owes the read through an alias under nested stores.
const held = globalThis.window;
let first, second;
const {
  of
} = (first = second = held).self.Array;
of(1);