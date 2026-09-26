// a parameter property declares its name in the constructor's own scope, so a body read of it is
// the PARAMETER and never the global - substituting the polyfill there would hand the caller's own
// argument to core-js. Both spellings of the wrapper run, since only the defaulted one carries a
// pattern the scope walk refuses. `Outside` is the negative that keeps the suppression from
// spreading: there the shadowed name is read OUTSIDE the constructor, where it is the global again.
// One global per role, so the two suppressed names are observable by their ABSENCE.
class Defaulted {
  constructor(public Map: any = function () {}) {
    this.own = new Map();
  }
}
class Bare {
  constructor(private WeakMap: any) {
    this.own = new WeakMap();
  }
}
class Outside {
  constructor(private Set: any) {}
  reach() {
    return new Set([1]);
  }
}
class Plain {
  constructor(public other: any) {
    this.own = new WeakSet();
  }
}
new Defaulted();
new Bare(function () {});
new Outside(function () {}).reach();
new Plain(1);
