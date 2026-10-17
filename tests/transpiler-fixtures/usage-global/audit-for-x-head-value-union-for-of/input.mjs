// a for-of HEAD rebinds the alias to each element of an array-literal iterable: every
// element is a reachable receiver past the loop, so its statics join the union. a distinct
// method-module per row attributes each head form. Static probes distinguish the receiver;
// the positional Iterator probe also keeps the typeless instance row beside that receiver.
let M = Object;
for (M of [Array]) { break; }
