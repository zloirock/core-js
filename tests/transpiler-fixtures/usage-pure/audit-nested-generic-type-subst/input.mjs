// generic alias whose body wraps the type-param inside `T[]` — inner Array type
// resolves through to the array polyfill for `.at`
type G<T> = Generator<T[]>;
function* gen(): G<string> { yield ['x']; }
for (const x of gen()) {
  globalThis.__r = x.at(0);
  break;
}
