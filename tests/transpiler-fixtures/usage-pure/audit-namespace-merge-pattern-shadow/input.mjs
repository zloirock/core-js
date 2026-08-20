// a namespace merged onto a SUBCLASS binds runtime statics after the class definition; a
// DESTRUCTURING export (plain, renamed) binds the slot exactly like the identifier form, so
// the `this.<staticField>` narrow inside an inherited static method must drop - the runtime
// value is whatever the pattern bound. a pattern binding OTHER names keeps the narrow
function source(): any { return null; }
class Base {
  static list = [1, 2];
  static tags = ['a'];
  static keep = [0];
  static stay = [9];
  static m() { return (this.list as any).at(0); }
  static probe() { return (this.tags as any).includes('a'); }
  static ctrl() { return (this.stay as any).at(1); }
  static viaComputed() { return (this.keep as any).at(2); }
}
class Sub extends Base {}
namespace Sub { export const { list } = source(); }
namespace Sub { export const { raw: tags } = source(); }
namespace Sub { export const { other } = source(); }
// a COMPUTED pattern key still binds its value name - the census is key-form-agnostic
namespace Sub { export const { [pick()]: keep } = source(); }
export const r = [Base.m(), Base.probe(), Base.ctrl(), Base.viaComputed()];
