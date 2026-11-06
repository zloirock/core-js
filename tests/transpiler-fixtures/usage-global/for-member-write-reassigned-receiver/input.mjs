// Reassigning the receiver selects a value untouched by the loop's member write.
let values = [];
for (values.at of [0]) {
  values = 'abc';
  consume(values.at(-1));
}
