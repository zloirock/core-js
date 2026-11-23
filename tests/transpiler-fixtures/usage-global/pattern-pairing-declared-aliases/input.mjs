// Array-pattern aliases retain the value captured by each declaration.
const [a] = [Array];
const [b] = [a];
const [c] = [b];
c.of([3]);
