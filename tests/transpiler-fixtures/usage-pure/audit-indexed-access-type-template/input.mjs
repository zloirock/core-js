// `Cfg[`items`]` - template-literal index key is equivalent to `Cfg['items']` per TS spec.
// single-quasi template should resolve to the same member lookup as the string form
type Cfg = { items: number[] };
declare const x: Cfg[`items`];
x.at(0);
