import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A quoted enum member name is a value-bearing id node rather than an identifier. Reading only the
// identifier slot loses the member and leaves the receiver opaque, which is visible here as array
// modules a resolved receiver never pulls in - a parity check between the two parsers cannot see
// it, because both of them carry the name in the same slot.
enum Quoted {
  "Name" = "core",
  "Count" = 1
}
const text: Quoted = Quoted.Name;
const count: Quoted = Quoted.Count;
_atMaybeString(text).call(text, 0);
count.includes(1);