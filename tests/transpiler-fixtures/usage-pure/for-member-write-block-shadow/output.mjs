import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A body-local receiver is distinct from the loop head's namesake.
const values = [];
for (values.at of functions) {
  const values = 'abc';
  consume(_atMaybeString(values).call(values, -1));
}