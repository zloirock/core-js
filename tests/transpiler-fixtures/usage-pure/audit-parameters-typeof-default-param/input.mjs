// `Parameters<typeof fn>` must unwrap the default-value-param wrapper (`x = 'a'`) to read
// the underlying type annotation on the LHS, so chained `.at(-1)` on the tuple element
// resolves to string
function fn(x: string = 'a') { return x; }
declare const args: Parameters<typeof fn>;
args.at(0)?.at(-1);
