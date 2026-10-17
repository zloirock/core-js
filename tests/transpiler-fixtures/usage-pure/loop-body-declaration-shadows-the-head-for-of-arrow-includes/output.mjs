import _includes from "@core-js/pure/actual/instance/includes";
for (const t of ['abc']) {
  use(() => _includes(t).call(t, 'b'));
  let t = pick();
}