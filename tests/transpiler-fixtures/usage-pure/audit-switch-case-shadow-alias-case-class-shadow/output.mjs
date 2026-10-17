import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
export function caseClassShadow(cond, mk) {
  let S = String;
  switch (cond) {
    case 1:
      class S {}
      mk(S);
  }
  return _String$fromCodePoint(66);
}