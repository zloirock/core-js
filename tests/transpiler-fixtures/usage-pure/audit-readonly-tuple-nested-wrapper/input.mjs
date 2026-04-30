// nested structure-preserving wrapper around tuple: `Readonly<Readonly<[T, U]>>`. each
// `Readonly<>` peel must recurse through `findTupleElement` so the inner tuple is
// reached. mirrors `findTypeMember`'s recursive peel pattern - the peel-before branch
// recurses through `findTupleElement(peeledBefore, ...)` so any depth of wrapper nesting
// resolves
type DoublyReadonly = Readonly<Readonly<[string[], number]>>;
declare const xs: DoublyReadonly[0];
xs.at(0);
