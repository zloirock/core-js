// `resolveSuperClassName` alias chain terminates on proxy-global member: `globalThis.Promise`
// is a proxy-global init, so the walk returns `Promise` (via `globalProxyMemberName`) instead
// of bailing on non-Identifier init
const P = globalThis.Promise;
class C extends P {
  static run() { return super.try(() => 1); }
}
