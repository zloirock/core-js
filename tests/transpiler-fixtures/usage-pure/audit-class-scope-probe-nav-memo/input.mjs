// a class body holds no `var`, so a nav that needs a receiver memo inside one cannot declare it
// where it sits. the axis walks every slot the body offers: a field initializer and a computed KEY
// run in the ENCLOSING scope (their memo hoists past the class), while a static block and a method
// open their own function scope and take a local declaration
globalThis.classBox = { list: ['ab', 'cd'], n: 7, key: 'm' };
export class Slots {
  inst = globalThis.window?.self.classBox.list?.at(0);
  static stat = globalThis.window?.self.classBox.n;
  #priv = (globalThis.window?.self.classBox).list?.at(0);
  static { globalThis.classStatic = globalThis.window?.self.classBox.list?.at(0); }
  method() { return globalThis.window?.self.classBox.list?.at(0); }
  readPriv() { return this.#priv; }
}
export class Keys {
  [globalThis.window?.self.classBox.list?.at(0)] = 1;
  static [globalThis.window?.self.classBox.key ?? 'q']() { return 2; }
}

// a heritage clause takes a whole expression, and a class nested inside a method reaches for THAT
// method's scope rather than the module's
export class Heritage extends (globalThis.window?.self.classBox.list ? Array : Object) {}
export const nested = class {
  run() { return class { inner = globalThis.window?.self.classBox.list?.at(0); }; }
};

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.classBox.list ? 0 : 1)?.includes('a');
