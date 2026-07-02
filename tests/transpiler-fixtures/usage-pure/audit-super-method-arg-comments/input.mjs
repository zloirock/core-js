// super.static(args) replacement must preserve leading, trailing, and mid-arg comments -
// the emitted call slice has to span the full argument list including surrounding trivia
class X extends Array {
  static make() {
    return super.from(/* pre */ [1, 2] /* post */);
  }
}
