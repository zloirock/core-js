// Interface extends Base<U[]> — receiver passes its own typearg through, parent extends carries
// the substituted form. appendInterfaceExtendsMembers (line 1172) applies ifaceSubst to parentRef args first,
// then descends. Tests deep substitution through extends with array-wrapped type-param.
interface Base<X> {
  inner: X;
}
interface Wrap<T> extends Base<T[]> {
  outer: T;
}
declare const w: Wrap<string>;
w.inner.at(0);
