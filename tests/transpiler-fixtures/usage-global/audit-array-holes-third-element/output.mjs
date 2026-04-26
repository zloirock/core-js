import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// array-pattern with holes `[,, third]`: skip slots must not shift the binding index;
// `third` resolves to the third real element and gets the array-instance polyfill.
const [,, third] = ['a', 'b', 'c'];
third.at(0);