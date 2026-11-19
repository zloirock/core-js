import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.string.iterator";
// a written value reached through a const ALIAS dereferences like any walk hop
const AliasA = Array;
const ca = {
  k: Object
};
ca.k = AliasA;
const {
  fromAsync: viaAliasValue
} = ca.k;
export { viaAliasValue };