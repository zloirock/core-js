import _Array$from from "@core-js/pure/actual/array/from";
// super.static(args) replacement must preserve leading, trailing, and mid-arg comments -
// the emitted call slice has to span the full argument list including surrounding trivia
class X extends Array {
  static make() {
    return _Array$from.call(this, /* pre */[1, 2] /* post */);
  }
}