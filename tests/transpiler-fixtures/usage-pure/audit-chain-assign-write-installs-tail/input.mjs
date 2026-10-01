// a chain assignment writes its TAIL into every name on the chain, so a dominating `x = y = V` write
// installs `V` whatever channel later reads the alias: a bare receiver, a computed key, a callee, an
// array-wrapper alias, a class base and a class static container. one write-value canon answers
// them all - a channel judging the raw `y = V` node resolves nothing and drops the polyfill
// the bare receiver takes the tail as the ONE value its read observes: the dominating write is the
// live value, so the static binds the ponyfill outright - no runtime ctor guard is owed

let recv = Object, r2;
recv = r2 = Array;
export const bareReceiver = recv.from('ab');

let key = 'isArray', k2;
key = k2 = 'fromAsync';
export const computedKey = Array[key]([]);

let mk = () => ({}), m2;
mk = m2 = () => globalThis;
export const callee = mk().Array.of(1);

let wrap = [Object], w2;
wrap = w2 = [Promise];
const [{ allSettled }] = wrap;
export const wrapperAlias = allSettled([]);

let base = Object, b2;
base = b2 = Reflect;
class Base extends base {
  static go() { return super.ownKeys({}); }
}
export const classBase = Base.go();

let box = { B: Object }, x2;
box = x2 = { B: Map };
class Boxed extends box.B {
  static go() { return super.groupBy([], () => 1); }
}
export const classContainer = Boxed.go();
