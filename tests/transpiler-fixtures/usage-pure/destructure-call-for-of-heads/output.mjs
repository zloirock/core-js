import _Array$of from "@core-js/pure/actual/array/of";
import _Math$sinh from "@core-js/pure/actual/math/sinh";
import _Object$is from "@core-js/pure/actual/object/is";
// a for-of HEAD over call elements pairs the same way: the alias holds the element's slot value, the
// head's nested claim mirrors the callee's literal in the element with the call kept ahead, and a
// head over SEVERAL elements - an IIFE and a call among them - claims per element. one static per row
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
  a: {
    sinh: _Math$sinh
  }
}))(), (built(), {
  a: {
    sinh: _Math$sinh
  }
})]) use(viaTwoElements(1));