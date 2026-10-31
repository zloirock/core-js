// A parameter property declares its name in the constructor's own scope, so a body read of it is the PARAMETER and never the
// global - substituting the polyfill there would hand the caller's own argument to core-js.
class Defaulted {
  constructor(public Map: any = function () {}) {
    // @ts-expect-error dynamic JS adds a member the declared type lacks
    this.own = new Map();
  }
}
new Defaulted();
