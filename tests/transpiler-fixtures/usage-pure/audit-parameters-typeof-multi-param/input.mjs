// documented approximation: `Parameters<typeof fn>` picks only the FIRST param's type
// as the tuple element. regression lock for future union-inference changes
function fn(x: string, y: number) { return x; }
declare const args: Parameters<typeof fn>;
args.at(0)?.at(-1);
