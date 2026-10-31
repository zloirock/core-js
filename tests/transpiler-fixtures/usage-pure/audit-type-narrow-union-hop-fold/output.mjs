import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5;
// an INTERMEDIATE hop through a union must fold its branches, not take the first that
// resolves: a value matching a later branch would dispatch through the first branch's
// type-specific helper and throw. convergent branches keep the narrow
type ArrayHop = {
  item: {
    value: string[];
  };
};
type StringHop = {
  item: {
    value: string;
  };
};
declare const divergent: ArrayHop | StringHop;
export const degraded = _at(_ref = divergent.item.value).call(_ref, 0);
type NumberHop = {
  item: {
    value: number[];
  };
};
declare const convergent: ArrayHop | NumberHop;
export const narrowed = _atMaybeArray(_ref2 = convergent.item.value).call(_ref2, 0);
declare const single: ArrayHop;
export const singleBranch = _atMaybeArray(_ref3 = single.item.value).call(_ref3, 0);
// the same fold applies when the hop is a CALL RETURN rather than a member. a structural return
// resolves to no runtime type, so the branches fold to nothing - which is NOT divergence, and
// identical returns must keep their narrow
type ArrayMaker = {
  make(): {
    rows: number[];
  };
};
type OtherArrayMaker = {
  make(): {
    rows: string[];
  };
};
declare const makers: ArrayMaker | OtherArrayMaker;
export const viaCall = _includesMaybeArray(_ref4 = makers.make().rows).call(_ref4, 1);
// diverging FAMILIES behind the same call still degrade
type StringMaker = {
  make(): {
    rows: string;
  };
};
declare const mixed: ArrayMaker | StringMaker;
export const viaCallDegraded = _at(_ref5 = mixed.make().rows).call(_ref5, 0);