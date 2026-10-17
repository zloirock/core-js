// a negated numeric generic call-arg (`pick(-1)`) resolves `Items[K]` with `K = -1`: the arg parses as
// a UnaryExpression wrapper that the literal-index extractor must unwrap. `Items["-1"]` is `number[]`,
// so `.at` narrows to the array variant
type Items = { "-1": number[]; "0": string };
function pick<K extends keyof Items>(k: K): Items[K] { return null as any; }
const r = pick(-1);
r.at(0);
