// a class's type parameters are bound by what its receiver spells: inside the class a `this` is
// whatever the instance was made with, so its reads stay within the constraint rather than take the
// default, and a `super` read takes the parent's from the heritage clause
class Box<T extends string | string[] = string[]> {
  v: T;
  constructor(v: T) {
    this.v = v;
  }
  last() {
    return this.v.at(-1);
  }
}
class Base<T extends string | string[] = string[]> {
  v: T;
  constructor(v: T) {
    this.v = v;
  }
  get(): T {
    return this.v;
  }
}
export class Sub extends Base<string> {
  has() {
    return super.get().includes('a');
  }
}
