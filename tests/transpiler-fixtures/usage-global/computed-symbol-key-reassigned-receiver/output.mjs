import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A computed symbol key changes a mutable receiver binding after its value is selected.
// Iterator consumption captures that value before key effects and calls its iterator once.
let arr = ['held'];
export const result = arr[arr = ['swapped'], Symbol.iterator]().next().value;