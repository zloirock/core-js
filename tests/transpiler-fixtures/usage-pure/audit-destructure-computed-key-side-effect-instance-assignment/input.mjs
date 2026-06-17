// a side-effecting computed key resolving to an INSTANCE method in a destructuring-ASSIGNMENT (no
// declaration to extract a `const` into). the destructure stays in place so the key effect runs once,
// then a `= _flatMaybeArray(recv)` overwrite after the statement makes the polyfill win - dropping the
// destructure (and with it the key effect) would lose `effectful()`
let m;
({ [(effectful(), 'flat')]: m } = arr);
const probe = [1, 2].includes(2);
