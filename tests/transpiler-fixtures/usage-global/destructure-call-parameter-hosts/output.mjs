import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.math.acosh";
import "core-js/modules/es.math.asinh";
import "core-js/modules/es.math.atanh";
import "core-js/modules/es.math.clz32";
import "core-js/modules/es.math.cosh";
import "core-js/modules/es.math.tanh";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
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
export const fromArgument = readArgument(built());
const builtPair = () => [Math];
function readArrayArgument([{
  tanh: viaArrayArgument
}]) {
  return viaArrayArgument(1);
}
export const fromArrayArgument = readArrayArgument(builtPair());
function readCallDefault({
  a: {
    acosh: viaCallDefault
  }
} = built()) {
  return viaCallDefault(1);
}
export const fromCallDefault = readCallDefault();
for (const {
  a: {
    asinh: viaHeadMemo
  },
  z: besideHead
} of [built()]) use(viaHeadMemo(1), besideHead);
function readDefaultMemo({
  a: {
    atanh: viaDefaultMemo
  },
  z: besideDefault
} = built()) {
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
export const fromArgumentMemo = readArgumentMemo(built());