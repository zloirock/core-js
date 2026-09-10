// A namespaced JSX name lowers to a single string - `<Symbol:x />` is the element type "Symbol:x",
// never the global - so NEITHER half of one references a binding, in a tag slot or an attribute
// slot, whatever its case. The last row is the control: the same globals in a bare tag and a member
// root do reference, so the file shows the boundary rather than an empty output.
export const nsTagNamespace = <Symbol:x y={1} />;
export const nsTagName = <ns:WeakRef y={2} />;
export const nsAttrNamespace = <Other URL:z={3} />;
export const nsAttrName = <Other z:AggregateError={4} />;

export const referenced = [<Map x={5} />, <Set.Sub y={6} />];
