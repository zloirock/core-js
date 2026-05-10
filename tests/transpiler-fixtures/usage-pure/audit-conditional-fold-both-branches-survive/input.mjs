// undecidable conditional with BOTH branches yielding viable members; fold builds union
// preserving member dispatch on each
type Wrap<T> = T extends string ? { items: number[] } : { items: string[] };
declare const w: Wrap<number>;
w.items.at(0);
w.items.flat();
