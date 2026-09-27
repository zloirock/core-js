// The iterable is evaluated before the loop writes its target.
const values = [[1, 2]];
for (values.at of values.at(0)) consume(values.at);
