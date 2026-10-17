import _at from "@core-js/pure/actual/instance/at";
for (const s of ['abc']) {
  let s = pick();
  use(_at(s).call(s, -1));
}