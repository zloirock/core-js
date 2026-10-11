// a for-of element stands below the head's own source, so the head reads a static off a store in
// it as written, and the constructor it lands on takes its whole entry. an element holding the
// container without a store keeps the static named
let cache;
for (const { D: { groupBy } } of [(cache = { D: Map })]) console.log(groupBy);

const box = { D: Promise };
for (const { D: { allSettled } } of [box]) console.log(allSettled);
