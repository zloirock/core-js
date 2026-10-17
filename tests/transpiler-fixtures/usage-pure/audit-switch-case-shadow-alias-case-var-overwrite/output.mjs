import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
export function caseVarOverwrite(cond, mk) {
  var R = _Reflect;
  switch (cond) {
    case 1:
      var R = mk();
  }
  return (R === _Reflect ? _Reflect$ownKeys : R.ownKeys.bind(R))({
    a: 1
  });
}