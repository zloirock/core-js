// nested `Readonly<>` wrappers around a tuple type: `Readonly<Readonly<[string[], number]>>`.
// each layer must peel transparently so the underlying tuple element shape survives,
// letting `xs.at(0)` reach the array-specific polyfill
type DoublyReadonly = Readonly<Readonly<[string[], number]>>;
declare const xs: DoublyReadonly[0];
xs.at(0);
