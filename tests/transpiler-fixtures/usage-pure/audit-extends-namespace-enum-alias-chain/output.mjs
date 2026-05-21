// const alias inside namespace where the aliased binding is itself the enum-shadowed
// Promise. `resolveSuperClassName` follows `Local -> enum Promise` via the VariableDeclarator
// init; without path threading the alias chain bottoms out on `Promise` and TS-runtime
// shadow detection misses the enum (estree-toolkit's scope tracker doesn't track namespace
// bodies), so `super.try` would route to the global
namespace M {
  export enum Promise {
    A = 0,
  }
  const Local = Promise;
  export class C extends (Local as any) {
    static run() {
      return super.try(() => 1);
    }
  }
}
M.C.run();