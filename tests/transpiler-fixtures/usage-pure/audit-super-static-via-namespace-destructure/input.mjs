// `class C extends MyP` where MyP comes from a user-namespace destructure `const { Promise: MyP } = NS`,
// NS being a const-bound object containing the real Promise. resolveSuperClassName must
// synthesize the equivalent `NS.Promise` member access and resolve through the unified
// namespace walker - otherwise the destructure-key info is lost and `super.try()` falls
// through without emitting the Promise.try polyfill
const NS = { Promise };
const { Promise: MyP } = NS;
class C extends MyP {
  static run() { return super.try(() => 1); }
}
C.run();
