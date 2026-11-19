import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// A pattern level whose value is a selection or a call pairs every arm and what the call canon pairs
// the call with - a factory's literal, every literal disagreeing returns spell - at the head and at
// every nested level, so a static read off the binding is served for each constructor it may hold
const flag = _globalThis.flag;
const make = () => ({
  a: Array
});
function pick() {
  if (flag) return {
    a: Object
  };
  return {
    a: Math
  };
}
const {
  a: HeadSelected
} = flag ? {
  a: Array
} : {
  a: Math
};
const {
  k: {
    a: NestedSelected
  }
} = {
  k: flag ? {
    a: Number
  } : {
    a: Math
  }
};
const {
  k: {
    a: NestedCall
  }
} = {
  k: make()
};
const {
  k: {
    a: NestedReturns
  }
} = {
  k: pick()
};
export const r = [(HeadSelected === Array ? _Array$from : HeadSelected.from.bind(HeadSelected))([1]), (NestedSelected === Number ? _Number$isInteger : NestedSelected.isInteger.bind(NestedSelected))(1), _Array$of(1), (NestedReturns === Object ? _Object$fromEntries : NestedReturns.fromEntries.bind(NestedReturns))([])];