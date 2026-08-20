// defensive bail: class has a `then` method but its first parameter isn't a function-type
// (`cb: string` instead of `cb: (v: T) => ...`). without a function-shaped first arg
// the Thenable contract doesn't hold, so `await x` returns the receiver AS-IS. `arr` resolves
// to NotAThenable (plain Object), `.at` not a member, polyfill provider skips emission
class NotAThenable {
  then(_cb: string): NotAThenable {
    return this;
  }
}
declare const n: NotAThenable;
async function go() {
  const arr = await n;
  arr.at(0);
}
go();