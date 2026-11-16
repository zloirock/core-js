// A later store cannot change an already captured alias.
let first;
[first] = [Array];
const [held] = [first];
[first] = [Object];
held.from([3]);
