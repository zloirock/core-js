import _at from "@core-js/pure/actual/instance/at";
// Reassigning the receiver selects a value untouched by the loop's member write.
let values = [];
for (values.at of [0]) {
  values = 'abc';
  consume(_at(values).call(values, -1));
}