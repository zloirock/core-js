import _Promise from "@core-js/pure/actual/promise/constructor";
for (const P of [_Promise]) {
  class P {}
  use(P.try);
}