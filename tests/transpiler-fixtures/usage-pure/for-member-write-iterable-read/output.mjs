import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The iterable is evaluated before the loop writes its target.
const values = [[1, 2]];
for (values.at of _atMaybeArray(values).call(values, 0)) consume(values.at);