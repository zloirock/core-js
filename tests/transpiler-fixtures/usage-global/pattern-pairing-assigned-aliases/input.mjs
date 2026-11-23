// Pattern assignments carry their slot value, not the enclosing array.
let a, b, c;
[a] = [Array];
[b] = [a];
[c] = [b];
c.of([3]);
