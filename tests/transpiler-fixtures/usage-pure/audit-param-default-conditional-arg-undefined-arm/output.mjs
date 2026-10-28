import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// an undefined-shaped call argument applies the default at the parameter slot;
// keep that argument unchanged so the default's property reads follow all arguments
export const viaTernary = function ({
  from
} = {
  from: _Array$from
}) {
  return from;
}(cond ? undefined : {
  from: _Iterator$from
});
export const viaVoid = function ({
  of
} = _Iterator) {
  return of;
}(cond ? void 0 : {
  of: _Array$of
});
// a `null` arm stays raw: destructuring null throws natively and the default never applies
export const nullArm = function ({
  from
} = Array) {
  return from;
}(cond ? null : {
  from: _Iterator$from
});
// an SE-bearing default stays raw on the arm - substituting it would change WHEN eff() runs
export const seDefault = function ({
  from
} = (eff(), Array)) {
  return from;
}(cond ? undefined : {
  from: _Iterator$from
});