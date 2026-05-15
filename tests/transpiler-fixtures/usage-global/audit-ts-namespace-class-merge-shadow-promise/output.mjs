// user-local `class Promise + namespace Promise` shadows the global Promise. two
// layers of protection compose: (1) shadow check on `Promise` identifier suppresses
// global Promise polyfills via the static-Promise route; (2) merged namespace lookup
// resolves `Promise.allWait()` to user's `Promise<T>` so downstream `.at(0)` on the
// result bails (no .at on the user class). without (2), `result` type stays unknown
// and `.at(0)` would over-inject array.at + string.at via common dispatch
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