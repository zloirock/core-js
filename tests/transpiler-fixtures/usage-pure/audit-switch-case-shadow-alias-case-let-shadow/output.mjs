import _Array$from from "@core-js/pure/actual/array/from";
// Case-level lexical bindings cover the case block, including writes in other cases. They do not rebind an outer alias or cover
// the discriminant.
export function caseLetShadow(cond, mk) {
  let M = Array;
  switch (cond) {
    case 1:
      let M = mk();
      M = mk();
  }
  return _Array$from([1]);
}