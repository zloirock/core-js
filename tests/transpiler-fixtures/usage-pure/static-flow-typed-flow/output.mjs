import _at from "@core-js/pure/actual/instance/at";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// Type assertions do not remove reachable values or the source receiver check.
function f(c: boolean) {
  let x: string | number[] = [1];
  if (c) x = _padStartMaybeString('ab').call('ab', 3) as string;else x = [2];
  return _at(x).call(x, -1);
}
f(true);
f(false);
export {};