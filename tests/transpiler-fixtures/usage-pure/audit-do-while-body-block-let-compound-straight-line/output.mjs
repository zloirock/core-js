import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// let declared inside a do-while body BlockStatement. each iteration enters the
// block once and the straight-line walker must read through `.body` to honour the
// compound-assign before the polyfillable call. at picks a method that does not
// plumb a specific type so the narrow is genuinely driven by flow.
do {
  let x: string | number[] = [];
  x = "  hi  ";
  _atMaybeString(x).call(x, 0);
} while (false);