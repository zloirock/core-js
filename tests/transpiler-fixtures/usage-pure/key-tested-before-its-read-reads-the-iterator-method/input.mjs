// a key a test the build decides installs is often tested before it is read (`key && r[key]`): what the
// test reads decides nothing there, and the read after it still sees the write land on every path, so
// it is the iterator method
let andKey;
if (typeof Symbol != 'undefined') andKey = Symbol.iterator;
export const andRead = r => andKey && r[andKey];
let ifKey;
if (typeof Symbol != 'undefined') ifKey = Symbol.iterator;
export function ifRead(r) {
  if (ifKey && r[ifKey]) return r[ifKey];
}
let ternaryKey;
if (typeof Symbol == 'function') ternaryKey = Symbol.iterator;
export const ternaryRead = r => ternaryKey ? r[ternaryKey] : null;
