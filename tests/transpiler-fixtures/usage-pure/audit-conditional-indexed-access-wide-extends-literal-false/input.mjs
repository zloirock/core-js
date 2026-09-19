// conditional type via indexed access: `T extends 'a' ? {items:number[]} : {items:string}`
// instantiated as `Wrap<string>`. `string extends 'a'` is FALSE (a wide string is not assignable
// to the literal 'a'), so the conditional DECIDES the false branch `{items: string}` - `r.items.at(0)`
// must resolve through the conditional + indexed access to string, not the true branch's array
type Wrap<T> = T extends 'a' ? { items: number[] } : { items: string };
declare const r: Wrap<string>;
r.items.at(0);
