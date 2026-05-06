// `Reflect.setPrototypeOf(o, proto)` mirrors Object.setPrototypeOf via the Reflect API. only
// rewires [[Prototype]], leaves own properties intact - same reasoning as the Object.
// setPrototypeOf companion fixture: our property-type tracking only sees OWN slots, so
// inherited reshuffling is invisible to it. no `mutatesArgument` annotation, classifier
// returns 'trivial', narrowing on `arr` survives
const o = {
  arr: [1, 2, 3],
  test() {
    Reflect.setPrototypeOf(o, null);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
