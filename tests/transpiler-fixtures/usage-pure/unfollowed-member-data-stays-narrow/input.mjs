// a member value read back through `this` or an instance - an instance field, getter or constructor
// return, a static read through `this` in a static member or through a subclass, and a literal slot one
// of its functions reads through `this` - is a route the census does not follow, so pure keeps the
// narrow entry there, which carries none of the statics read through it
class A { map = Map; get promise() { return Promise; } }
class B { constructor() { return Iterator; } }
class C { static symbol = Symbol; static run() { return this.symbol.for('c'); } }
class E { static error = AggregateError; }
class F extends E { static run() { return super.error.isError(null); } }
const box = { url: URL, run() { return this.url.canParse('a:b'); } };
export const grouped = new A().map.groupBy([1], x => x);
export const resolvers = new A().promise.withResolvers();
export const iterated = new B().from([1]);
export const key = C.run();
export const isError = F.run();
export const parses = box.run();
