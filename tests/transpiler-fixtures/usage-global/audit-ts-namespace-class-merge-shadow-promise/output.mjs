// User-local `class Promise` + `namespace Promise` shadow the global `Promise`.
// No global Promise polyfills should be emitted for any reference to this local
// `Promise`. Additionally, `Promise.allWait([1,2,3])` must resolve via the merged
// namespace to the user's `Promise<T>` instance, so `.at(0)` on the result must
// NOT emit Array#at or String#at - the user class has no `at`.
class Promise<T> {
  then<U>(cb: (v: T) => U): Promise<U> {
    return new Promise<U>();
  }
}
namespace Promise {
  export function allWait<T>(items: T[]): Promise<T> {
    return new Promise<T>();
  }
}
const result = Promise.allWait([1, 2, 3]);
result.at(0);