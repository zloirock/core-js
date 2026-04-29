import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Early-exit `if (typeof x !== 'string') return;` inside a decorator-arg arrow narrows
// `x` to `string` for subsequent statements. The statement-sibling walk needs the
// containing block path to expose both the index and the parent body-list label, in a
// babel-compatible shape, so the unplugin synth path matches the babel-plugin behaviour
function dec(fn: (x: number | string) => void) {
  return (_: any) => _;
}
@dec(x => {
  if (typeof x !== 'string') return;
  _atMaybeString(x).call(x, 0);
})
class A {}