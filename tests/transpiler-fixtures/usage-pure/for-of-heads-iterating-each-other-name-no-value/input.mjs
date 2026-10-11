// two `var` heads iterating each other: each element reads the other head's hoisted `undefined` on the
// first pass, so neither names a value, the walk ends instead of following the cycle, and the selections
// over them keep their live reads
for (var A of [B]) for (var B of [A]) use((A || Object).from(x), (B || Object).from(x));
