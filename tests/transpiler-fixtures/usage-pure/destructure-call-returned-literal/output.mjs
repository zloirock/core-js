import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _Math$cbrt from "@core-js/pure/actual/math/cbrt";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
import _String$raw from "@core-js/pure/actual/string/raw";
// a destructure whose init is a CALL pairs through the literal the callee returns, the way an inline
// literal pairs: a factory, the array twin, a block body with a statement ahead of its return, an
// IIFE, a method of a literal, a nested slot, a sequence return whose effect stays in the callee and
// an array wrapper over the call. one static per row
const factory = () => ({
  a: Math
});
const {
  a: viaFactory
} = factory();
export const fromFactory = _Math$trunc(1.5);
const list = () => [Object];
const [viaList] = list();
export const fromList = _Object$entries({});
function block() {
  _pushMaybeArray(log).call(log, 'block');
  return {
    a: Array
  };
}
const {
  a: viaBlock
} = block();
export const fromBlock = _Array$of(1);
const {
  a: viaIife
} = (() => ({
  a: String
}))();
export const fromIife = _String$raw`x`;
const maker = {
  build() {
    return {
      a: Math
    };
  }
};
const {
  a: viaMethod
} = maker.build();
export const fromMethod = _Math$sign(-1);
const deep = () => ({
  n: {
    a: Object
  }
});
const {
  n: {
    a: viaNested
  }
} = deep();
export const fromNested = _Object$values({});
const seq = () => (_pushMaybeArray(log).call(log, 'seq'), {
  a: Math
});
const {
  a: viaSeq
} = seq();
export const fromSeq = _Math$cbrt(8);
const wrapped = () => [{
  a: String
}];
const [{
  a: viaWrapped
}] = wrapped();
export const fromWrapped = _String$fromCodePoint(65);