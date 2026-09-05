import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$getOwnPropertySymbols from "@core-js/pure/actual/object/get-own-property-symbols";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$values from "@core-js/pure/actual/object/values";
// a BARE constructor under a sole wrapper: the element's prefix lifts, a trailing neighbour lifts
// behind it, and the wrapper drops - the shape the nested static prints for the same neighbours;
// a constructor stored with its own effect prefix classifies by the tail and the write rides the
// extraction whole
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
eff('e');
const assign = _Object$assign;
eff('f');
const is = _Object$is;
eff('g');
eff('h');
const values = _Object$values;
const getOwnPropertySymbols = (kw = (eff('t'), Object), _Object$getOwnPropertySymbols);
export { assign, is, values, getOwnPropertySymbols, seen, kw };