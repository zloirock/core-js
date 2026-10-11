import _Map from "@core-js/pure/actual/map";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$defineProperties from "@core-js/pure/actual/object/define-properties";
import _Promise from "@core-js/pure/actual/promise";
import _Reflect$defineProperty from "@core-js/pure/actual/reflect/define-property";
import _Symbol from "@core-js/pure/actual/symbol";
// a member an explicit store puts on a function is the file's own (`Object.assign(fn, { make })`), not one
// `Function.prototype` carries: a constructor passed to it reaches a body the census does not read there, so it
// keeps its statics, whichever store spelled the member
function Host() {}
_Object$assign(Host, {
  make(C) {
    return C;
  }
});
export const made = Host.make(_Map);
function Other() {}
_Reflect$defineProperty(Other, 'take', {
  value: C => C
});
export const taken = Other.take(_Promise);
function Third() {}
_Object$defineProperties(Third, {
  give: {
    value: C => C
  }
});
export const given = Third.give(_Symbol);