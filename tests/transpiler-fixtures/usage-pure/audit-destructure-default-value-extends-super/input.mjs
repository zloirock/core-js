// `const { Promise: MyP = Fallback } = globalThis` - destructure with default value.
// findDestructureKeyForBinding unwraps AssignmentPattern.left to check the binding name.
// super.try should still polyfill to Promise.try because MyP resolves through the
// destructure key 'Promise' on a proxy-global root.
const { Promise: MyP = class {} } = globalThis;
class C extends MyP {
  static run() { return super.try(() => 1); }
}
