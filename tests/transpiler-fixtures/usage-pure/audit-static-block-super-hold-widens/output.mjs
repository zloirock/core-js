import _includes from "@core-js/pure/actual/instance/includes";
// a held `super.<staticMethod>` read inside a `static { }` block extracts the ancestor
// static with a rebindable `this` - the static-block member routes to the STATIC scan
// (it carries no `.static` flag), so the extraction gates the own-static narrow exactly
// like a held read in a static method
class Base {
  static ask() {
    return 'tag';
  }
}
class Kid extends Base {
  static tag = 'text';
  static held;
  static {
    Kid.held = super.ask;
  }
  static read() {
    var _ref;
    return _includes(_ref = this.tag).call(_ref, 't');
  }
}
export const viaStaticBlockHold = Kid.read();