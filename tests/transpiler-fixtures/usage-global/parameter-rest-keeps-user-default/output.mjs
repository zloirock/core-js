import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Declining the receiver mirror must not replace the author's leaf default.
let calls = 0;
export const out = (({
  from = (calls++, 'own'),
  ...rest
} = Array) => [from, rest])();
export { calls };