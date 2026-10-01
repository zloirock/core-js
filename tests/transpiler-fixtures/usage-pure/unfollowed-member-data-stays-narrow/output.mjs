import _AggregateError from "@core-js/pure/actual/aggregate-error/constructor";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _URL from "@core-js/pure/actual/url/constructor";
// a member value read back through `this` or an instance - an instance field, getter or constructor
// return, a static read through `this` in a static member or through a subclass, and a literal slot one
// of its functions reads through `this` - is a route the census does not follow, so pure keeps the
// narrow entry there, which carries none of the statics read through it
class A {
  map = _Map;
  get promise() {
    return _Promise;
  }
}
class B {
  constructor() {
    return _Iterator;
  }
}
class C {
  static symbol = _Symbol;
  static run() {
    return this.symbol.for('c');
  }
}
class E {
  static error = _AggregateError;
}
class F extends E {
  static run() {
    return super.error.isError(null);
  }
}
const box = {
  url: _URL,
  run() {
    return this.url.canParse('a:b');
  }
};
export const grouped = new A().map.groupBy([1], x => x);
export const resolvers = new A().promise.withResolvers();
export const iterated = new B().from([1]);
export const key = C.run();
export const isError = F.run();
export const parses = box.run();