import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// rest destructured into an object pattern (`[...{ length }]`) binds `length` to the rest
// Array's own length (a number), not to the Array itself - so `.at` must stay generic
// (Array|String) instead of mis-narrowing to Array-only off the discarded inner path
const [...{
  length
}] = arr;
length.at(-1);