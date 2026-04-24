import _Set from "@core-js/pure/actual/set/constructor";
// private auto-accessor `accessor #foo` - stage-3 combination of private-name and accessor
// semantics. `new Set()` in the field initializer resolves to the pure constructor polyfill;
// method body references the private field via `this.#foo`
class A {
  accessor #foo = new _Set();
  has(value) {
    return this.#foo.has(value);
  }
}