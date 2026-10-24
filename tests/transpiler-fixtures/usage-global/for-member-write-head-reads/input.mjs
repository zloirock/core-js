// Computed keys and defaults in the head are reads before their target writes.
const a = [1, 2];
for ({ [a.at(0)]: a.at } of xs) consume(a.at);
const b = [3, 4];
for ([b.includes = b.includes(4)] of ys) consume(b.includes);
