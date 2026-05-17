// class-level Decorator on a NESTED class declaration. without the boundary check, the
// walker steps past Decorator -> ClassDeclaration Inner -> BlockStatement -> Outer.m's
// function -> ClassBody (Outer's). that resolves `this.s` to Outer.s (string) and emits
// Maybe-string. but decorators evaluate in the OUTER scope at class-definition time, so
// `this` isn't actually anchored to the Outer instance from the decorator's perspective
declare function deco<T>(x: any): (target: T) => T;
class Outer {
  s: string = "hi";
  m() {
    @deco(this.s.at(0))
    class Inner {
      f: number = 1;
    }
  }
}
