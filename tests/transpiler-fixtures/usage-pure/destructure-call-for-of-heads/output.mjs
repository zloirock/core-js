import _Array$of from "@core-js/pure/actual/array/of";
import _Math$sinh from "@core-js/pure/actual/math/sinh";
import _Object$is from "@core-js/pure/actual/object/is";
// A literal keeps its native slots while an independently resolved call supplies its static.
// Reads and effects remain inside their source control-flow positions.
const headed = () => ({
  a: Object
});
for (const {
  a: viaHead
} of [headed()]) use(_Object$is(5, 5));
const headedDeep = () => ({
  n: Array
});
for (const {
  n: {
    of: viaHeadDeep
  }
} of [(headedDeep(), {
  n: {
    of: _Array$of
  }
})]) use(viaHeadDeep(6));
const built = () => ({
  a: Math
});
for (const {
  a: {
    sinh: viaTwoElements
  }
} of [(() => ({
  a: Math
}))(), (built(), {
  a: {
    sinh: _Math$sinh
  }
})]) use(viaTwoElements(1));