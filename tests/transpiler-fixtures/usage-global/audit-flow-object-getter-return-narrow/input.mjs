// A Flow object-type getter resolves to its declared return type, not the function type, so
// the chained call narrows to the array variant.
declare var x: { get items(): Array<number> };
x.items.at(-1);
