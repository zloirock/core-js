// `Parameters<typeof fn>` must unwrap AssignmentPattern (`x = 'a'`) to read the underlying
// `typeAnnotation` on `.left`, so chained `.at(-1)` on the tuple element resolves to string
function fn(x: string = 'a') { return x; }
declare const args: Parameters<typeof fn>;
args.at(0)?.at(-1);
