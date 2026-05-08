// multi-hop user-namespace extends `class Sub extends NS.Inner.Base`: extendsClauseName
// must walk the entire MemberExpression chain, deriving root + walkPath, then defer to
// walkStaticReceiverChain for the const-bound object descent. without multi-hop support,
// the index falsely misses Sub as a Base subclass and external instance writes (`s.box =
// "..."`) stay unfolded - inherited Base.box stays narrow at array-only polyfill while
// runtime sees a string
class Base {
  box = [1, 2, 3];
  first() { return this.box.at(0); }
}
const NS = { Inner: { Base } };
class Sub extends NS.Inner.Base {}
const s = new Sub();
s.box = "stringified";
s.first();
