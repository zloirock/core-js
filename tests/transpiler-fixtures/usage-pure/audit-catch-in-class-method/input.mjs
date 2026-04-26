// catch destructure inside a class method body: pattern bindings still route through
// pure-mode instance-method polyfills when used in the body.
class C {
  m() { try {} catch ({ at }) { return at(0); } }
  static s() { try {} catch ({ flat }) { return flat(1); } }
}
