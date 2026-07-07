// usage-global twin of the this-static destructure remap: the inherited static's module is
// injected (the source stays untouched - the patched global serves the inherited read);
// a static field initializer is a static context; an assignment pattern routes through
// the same funnel
class FieldInit extends Array {
  static p = (() => { const { of } = this; return of; })();
}
export const viaField = FieldInit.p;

let picked;
class AssignTarget extends Array {
  static m() { ({ from: picked } = this); return picked; }
}
export const viaAssign = AssignTarget.m();

// sibling declarators in one declaration both inject
class TwoDecl extends Array {
  static m() {
    const { from } = this, { of } = this;
    return [from, of];
  }
}
export const viaTwoDecl = TwoDecl.m();

// a nested pattern hopping THROUGH the static still injects its module - the hop read
// itself needs the polyfilled global
class HopStatic extends Promise {
  static m() { const { try: { length } } = this; return length; }
}
export const viaHop = HopStatic.m();

// a rest-bearing param default still injects - the read reaches the patched global even
// though pure must bail on this form
class RestParam extends Array {
  static m({ of, ...rest } = this) { return [of, rest]; }
}
export const viaRestParam = RestParam.m();

// an own-static shadow and an instance method inject nothing; a `this` param-default
// injects like the declarator form
class ParamDefault extends Array {
  static m({ of } = this) { return of; }
}
export const viaParam = ParamDefault.m();
class Basic extends Array {
  static m() { const { from } = this; return from; }
}
export const viaBasic = Basic.m();

class Renamed extends Map {
  static m() { const { groupBy: g } = this; return g; }
}
export const viaRenamed = Renamed.m();

class Shadowed extends Promise {
  static any() { return 1; }
  static m() { const { any } = this; return any; }
}
export const viaShadowed = Shadowed.m();
