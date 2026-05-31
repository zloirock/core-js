// loop back-edge through a for-of: `x` is declared outside the loop and reassigned to a string in
// the body, so the next iteration's `x.includes()` may run on a string. the array narrow is stale -
// degrade to the generic instance variant.
declare function readString(): string;
let x = [1, 2, 3];
for (const _ of [0, 1]) {
  x.includes(1);
  x = readString();
}
