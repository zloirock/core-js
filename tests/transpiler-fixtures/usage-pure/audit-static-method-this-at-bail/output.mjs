// in a static method, `this` is the constructor. Array has no own `at` (only
// Array.prototype.at), so `this.at(0)` throws at runtime. no helper fits: an instance
// wrapper (`_at.call(this, 0)`) would target the Array constructor itself - wrong receiver.
// the transform bails so the user's bug surfaces unchanged, not papered over.
class C extends Array {
  static run() {
    return this.at(0);
  }
}