import _Math$acosh from "@core-js/pure/actual/math/acosh";
import _Math$asinh from "@core-js/pure/actual/math/asinh";
import _Math$atanh from "@core-js/pure/actual/math/atanh";
import _Math$clz32 from "@core-js/pure/actual/math/clz32";
import _Math$cosh from "@core-js/pure/actual/math/cosh";
import _Math$tanh from "@core-js/pure/actual/math/tanh";
var _ref, _ref2, _ref3;
// a call ARGUMENT yields the container the parameter's pattern reads, the call keeping its turn in
// the argument slot; so does a call in a parameter DEFAULT, run exactly when the source runs it.
// beside a PASSTHROUGH sibling the call runs once into a memo the sibling reads off, wherever the
// host holds it - a head, a default, an argument. one static per row
const built = () => ({
  a: Math,
  z: 1
});
function readArgument({
  a: {
    cosh: viaArgument
  }
}) {
  return viaArgument(1);
}
export const fromArgument = readArgument((built(), {
  a: {
    cosh: _Math$cosh
  }
}));
const builtPair = () => [Math];
function readArrayArgument([{
  tanh: viaArrayArgument
}]) {
  return viaArrayArgument(1);
}
export const fromArrayArgument = readArrayArgument((builtPair(), [{
  tanh: _Math$tanh
}]));
function readCallDefault({
  a: {
    acosh: viaCallDefault
  }
} = (built(), {
  a: {
    acosh: _Math$acosh
  }
})) {
  return viaCallDefault(1);
}
export const fromCallDefault = readCallDefault();
for (const {
  a: {
    asinh: viaHeadMemo
  },
  z: besideHead
} of [(_ref = built(), {
  a: {
    asinh: _Math$asinh
  },
  z: _ref.z
})]) use(viaHeadMemo(1), besideHead);
function readDefaultMemo({
  a: {
    atanh: viaDefaultMemo
  },
  z: besideDefault
} = (_ref2 = built(), {
  a: {
    atanh: _Math$atanh
  },
  z: _ref2.z
})) {
  return [viaDefaultMemo(0), besideDefault];
}
export const fromDefaultMemo = readDefaultMemo();
function readArgumentMemo({
  a: {
    clz32: viaArgumentMemo
  },
  z: besideArgument
}) {
  return [viaArgumentMemo(1), besideArgument];
}
export const fromArgumentMemo = readArgumentMemo((_ref3 = built(), {
  a: {
    clz32: _Math$clz32
  },
  z: _ref3.z
}));