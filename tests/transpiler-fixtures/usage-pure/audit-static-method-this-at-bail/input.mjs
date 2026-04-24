// in a static method, `this` is the constructor. Array has no own `at` method
// (only Array.prototype.at is defined), so `this.at(0)` throws "Array.at is not a
// function" at runtime. no helper fits here: an instance-style wrapper (`_at.call(this, 0)`)
// would call the instance helper on the Array constructor itself - wrong receiver shape.
// plugin bails; the user's bug surfaces unchanged rather than getting papered over by
// a semantically invalid polyfill
class C extends Array {
  static run() {
    return this.at(0);
  }
}
