import _Array$of from "@core-js/pure/actual/array/of";
import _Object$is from "@core-js/pure/actual/object/is";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
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
}))(), built()]) use(viaTwoElements(1));