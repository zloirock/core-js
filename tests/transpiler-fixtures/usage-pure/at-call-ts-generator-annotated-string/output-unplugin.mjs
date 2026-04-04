import _atMaybeString from "@core-js/pure/actual/string/instance/at";
function* gen(): Generator<string> { yield "x"; }
for (const x of gen()) { _atMaybeString(x).call(x, 0); }