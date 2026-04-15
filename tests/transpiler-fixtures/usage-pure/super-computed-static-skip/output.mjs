// computed key on super in static method — can't statically resolve, must skip polyfill injection
class X extends Array {
  static m(name) {
    return super[name];
  }
}