// a base class a subclass reads an inherited static through, given a constructor by an explicit store and
// then handed out, hands that constructor out with its statics in both legs: the store is filed before the
// walk stamping the base passes the class, and that walk keeps a state of its own - through `Object.assign`,
// `Reflect.set`, and `Object.defineProperty` on a container whose slot is the base
class Box {}
class Sub extends Box {}
Sub.groupBy([1], x => x);
Object.assign(Box, { C: Map });
install(Box);
class Holder {}
class Child extends Holder {}
Child.allSettled([]);
Reflect.set(Holder, 'C', Promise);
register(Holder);
const nest = { C: class {} };
class Leaf extends nest.C {}
Leaf.from([1]);
Object.defineProperty(nest, 'C', { value: Iterator });
keep(nest.C);
