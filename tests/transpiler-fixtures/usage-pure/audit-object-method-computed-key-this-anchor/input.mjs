// an object method's COMPUTED KEY evaluates at object-definition time in the OUTER `this`, not the
// object being defined - so `this.<field>` inside the key resolves against the enclosing scope,
// never the object's own members. here the enclosing `this` is the surrounding class instance, so
// the key's receiver is NOT the inner object's array field; the call stays generic. babel reaches
// the method as an ObjectMethod and oxc through a Property, but both must bail to the outer scope.
class Outer {
  data = "x";
  obj = {
    data: [1, 2, 3],
    [(() => this.data.at(0))()]() {},
  };
}

export const r = new Outer();
