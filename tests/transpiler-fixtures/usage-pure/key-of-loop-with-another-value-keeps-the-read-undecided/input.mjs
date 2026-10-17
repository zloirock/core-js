export function undecided(r, flag) {
  var k, e = 2;
  for (flag && (k = Symbol.iterator); e--;) {
    if (k && r[k]) return r[k];
    k = "@@iterator";
  }
}
