// Self-referential alias `type R<T = R<string[]>>` with cycle through default value.
// Cycle detection must bail to generic instance polyfill rather than infinite-recurse on the default.
type R<T = R<string[]>> = { val: T };
declare const x: R;
x.val.at(0);
