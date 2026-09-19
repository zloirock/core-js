// `Parameters<typeof fn>` element type = first param annotation (`number[]`) flows through
// to the chained `.at(0)` on the result - would otherwise resolve as generic instance-at
declare function fn(xs: number[]): void;
declare const args: Parameters<typeof fn>;
args.at(0)?.at(0);
