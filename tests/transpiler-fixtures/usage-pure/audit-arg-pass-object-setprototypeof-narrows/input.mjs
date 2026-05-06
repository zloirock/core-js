// `Object.setPrototypeOf(o, proto)` rewires the [[Prototype]] internal slot but does not
// touch any own property of `o`. our type tracking only models OWN properties (the
// ObjectExpression literal entries, `this.X = ...` writes inside methods, and module-wide
// `<binding>.X = Y` writes via the alias closure - all of which create / mutate own slots);
// inherited slots aren't tracked at all. since OWN always shadows inherited at read time,
// rewiring the prototype can't change the type of `o.arr`. setPrototypeOf carries no
// `mutatesArgument` annotation - classifier returns 'trivial', narrowing on `arr` survives
const o = {
  arr: [1, 2, 3],
  test() {
    Object.setPrototypeOf(o, null);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
