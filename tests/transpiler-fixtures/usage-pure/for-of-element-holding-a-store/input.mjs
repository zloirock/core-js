// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
let cache;
for (const { D: { groupBy } } of [(cache = { D: Map })]) console.log(groupBy);

const box = { D: Promise };
for (const { D: { allSettled } } of [box]) console.log(allSettled);
