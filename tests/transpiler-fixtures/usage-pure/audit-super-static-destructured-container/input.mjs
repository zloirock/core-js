// a destructured container `const { sub: NS } = lib` binds NS to lib.sub, so `extends NS.Promise`
// resolves through the inner object to the global Promise and super.try rewrites to promise/try
const lib = { sub: { Promise } };
const { sub: NS } = lib;
class C extends NS.Promise {
  static run() { return super.try(() => 1); }
}
