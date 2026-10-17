import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
export function undecided(r, flag) {
  var k,
    e = 2;
  for (flag && (k = _Symbol$iterator); e--;) {
    if (k && r[k]) return r[k];
    k = "@@iterator";
  }
}