// A body that suspends is not atomic: at the `await` the caller resumes and its own `c = [1]` runs
// between the assertion above and the read below. The guard is ranked against the suspension by
// POSITION, and the statement carrying it is one the emitter rebuilt for the `globalThis`
// destructure - it has no span to rank, so it counts as having run before the read and the narrow
// is dropped. A lane that read the missing span as a number would keep the string narrow and emit
// the string helper over an array.
declare function assertString(v: unknown): asserts v is string;
declare function use(...a: unknown[]): void;
let c: string | number[] = 'abc';
async function f() {
  var { Map: m, other } = (assertString(c), globalThis as any);
  await use(m, other);
  c.at(0);
}
use(f);
c = [1];
