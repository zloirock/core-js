// `Wrap<F, X> = F<X>` - typeparam F applied to typeparam X (HKT-style). substituting F's
// bound (`Array`) must rebuild the container with X as inner when the binding is a named
// container with empty inner, else typeArgs are dropped. chained `.at(0)?.at(0)`: first
// hop returns Array<string> (rebuilt inner); without the rebuild the second hop bails to generic
type Wrap<F, X> = F<X>;
declare const r: Wrap<Array, string[]>;
r.at(0)?.at(0);
