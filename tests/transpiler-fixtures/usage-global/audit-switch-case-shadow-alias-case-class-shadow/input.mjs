export function caseClassShadow(cond, mk) {
  let S = String;
  switch (cond) {
    case 1:
      class S {}
      mk(S);
  }
  return S.fromCodePoint(66);
}
