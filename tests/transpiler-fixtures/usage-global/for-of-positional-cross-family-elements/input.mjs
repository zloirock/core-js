// The same position may hold different receiver families on different iterations.
// Neither a first element nor a later matching element can narrow that position.
for (const [{ at }, { includes }] of [[[1], '02'], ['02', [1]], [[2], '12']]) use(at, includes);
