import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A called closure can replace the array held by an alias before a nested pattern reads it.
// Global usage collects the written static; pure keeps this unresolved native read.
let viaClosure = [Array];
const setClosure = () => {
  viaClosure = [Object];
};
setClosure();
const [{
  fromEntries
}] = viaClosure;
export const closureWrite = fromEntries([]);