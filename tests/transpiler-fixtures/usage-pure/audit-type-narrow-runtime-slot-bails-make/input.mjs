// type narrowing bails where the lexical declaration cannot speak for the runtime slot.
// a namespace merged onto a subclass attaches runtime statics AFTER the class definition,
// overriding the inherited slot - this-rooted static reads fall back to the generic dispatcher
class Base {
  static make(): number[] { return [1]; }
  static m() { return this.make().at(0); }
}
class Sub extends Base {}
namespace Sub {
  export function make(): string { return 's'; }
}
use(Base.m(), Sub.make());
