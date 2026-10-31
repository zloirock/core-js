import _Array$from from "@core-js/pure/actual/array/from";
// the diverging SE-key mirror on the ASSIGNMENT-cascade host (no declaration to extract into): the
// proxy branch mirrors to a synth literal under the resolved static key, the user-object branch stays
// native (no corruption), the effect stays in the residual LHS and runs once. distinct host from the
// declarator - it has no binding statement, so the extraction path declines and the mirror takes over
const userObj = {
  Array: {}
};
let from;
({
  Array: {
    [(eff(), "from")]: from
  }
} = cond ? {
  Array: {
    from: _Array$from
  }
} : userObj);
typeof from;