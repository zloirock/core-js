import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$getOwnPropertySymbols from "@core-js/pure/actual/object/get-own-property-symbols";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$values from "@core-js/pure/actual/object/values";
// Array-wrapped statics preserve leading and trailing element effects in source order.
// A receiver stored by assignment retains its original value before the pure binding is read.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
const [{
  assign
}] = [(eff('e'), {
  assign: _Object$assign
})];
const [{
  is
}] = [{
  is: _Object$is
}, eff('f')];
const [{
  values
}] = [(eff('g'), {
  values: _Object$values
}), eff('h')];
const [{
  getOwnPropertySymbols
}] = [(kw = (eff('t'), Object), {
  getOwnPropertySymbols: _Object$getOwnPropertySymbols
})];
export { assign, is, values, getOwnPropertySymbols, seen, kw };