export function caseVarOverwrite(cond, mk) {
  var R = Reflect;
  switch (cond) {
    case 1:
      var R = mk();
  }
  return R.ownKeys({ a: 1 });
}
