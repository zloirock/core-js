import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an IIFE destructure param carrying a DEFAULT, invoked with a non-simple receiver (a conditional /
// logical call-arg): the live call-arg is the receiver, NOT the dead default, so each branch's
// polyfill dependency (`Array.from` / `Array.of`) is injected rather than suppressed by the default.
// distinct keys trace each line.
const cond = true;
export const a = (({
  from
} = Object) => from([1]))(cond ? Array : Map);
export const b = (({
  of
} = Object) => of(1, 2))(globalThis.Poly || Array);