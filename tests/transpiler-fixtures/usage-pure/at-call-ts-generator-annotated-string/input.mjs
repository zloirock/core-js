function* gen(): Generator<string> { yield "x"; }
for (const x of gen()) { x.at(0); }
