import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a namespace merged onto a SUBCLASS binds runtime statics after the class definition; a
// DESTRUCTURING export (plain, renamed) binds the slot exactly like the identifier form, so
// the `this.<staticField>` narrow inside an inherited static method must drop - the runtime
// value is whatever the pattern bound. a pattern binding OTHER names keeps the narrow
function source(): any {
  return null;
}
class Base {
  static list = [1, 2];
  static tags = ['a'];
  static keep = [0];
  static stay = [9];
  static m() {
    var _ref;
    return _at(_ref = this.list as any).call(_ref, 0);
  }
  static probe() {
    var _ref2;
    return _includes(_ref2 = this.tags as any).call(_ref2, 'a');
  }
  static ctrl() {
    var _ref3;
    return _atMaybeArray(_ref3 = this.stay as any).call(_ref3, 1);
  }
  static viaComputed() {
    var _ref4;
    return _at(_ref4 = this.keep as any).call(_ref4, 2);
  }
}
class Sub extends Base {}
namespace Sub {
  export const {
    list
  } = source();
}
namespace Sub {
  export const {
    raw: tags
  } = source();
}
namespace Sub {
  export const {
    other
  } = source();
}
// a COMPUTED pattern key still binds its value name - the census is key-form-agnostic
namespace Sub {
  export const {
    [pick()]: keep
  } = source();
}
export const r = [Base.m(), Base.probe(), Base.ctrl(), Base.viaComputed()];