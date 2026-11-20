// The selection runs first. The later computed key sees the constructor bound by the first property.
for (const { Map: M, [(use(M), "Set")]: S } = flag ? globalThis : self; ;) break;
