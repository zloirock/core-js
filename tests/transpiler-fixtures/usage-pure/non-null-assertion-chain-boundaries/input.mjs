// Reprinting beside a polyfill preserves optional-chain boundaries under postfix assertions.
// Required calls and member reads outside a sealed chain still throw on a nullish root.
// An open chain and an optional continuation keep short-circuiting.
declare const root: any;
root?.fn!();
(root?.fn)!();
(root?.fn!)!();
(root?.fn)!.value;
(root?.fn)!?.();
[1, [2]].flat();
