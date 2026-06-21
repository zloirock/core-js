// `this` in a Decorator argument evaluates at class-definition time in the OUTER scope,
// NOT bound to the decorated class. anchoring must stop at the Decorator boundary, not
// climb past it to class C and resolve `this.s` to C.s (string), emitting a Maybe-string
// narrow. SOUNDNESS: the outer `this` may carry no `s` member at all
declare function deco<T>(x: any): (target: T) => T;
class C {
  s: string = "hi";
  @deco(this.s.at(0))
  foo() {}
}
