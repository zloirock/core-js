// `Parameters<typeof fn>` element type = commonType fold over ALL params: differing param types
// (here `string | number`) fold to a GENERIC element, so a value read off the tuple (`args.at(0)`)
// chains through the generic `.at`, NOT the first param's type - which would mis-dispatch a later
// element (a number) through the string helper. same-typed params keep their precise element type;
// literal index `T[N]` still picks the exact N-th via findTupleElement
function fn(x: string, y: number) { return x; }
declare const args: Parameters<typeof fn>;
args.at(0)?.at(-1);
