// `typeof` always yields a string - the member narrows and the string method polyfills
// @ts-expect-error a computed enum member the runtime makes a string is the shape under test
enum E4 { T = typeof globalThis }
// @ts-expect-error a computed enum member the runtime makes a string is the shape under test
use(E4.T.trimStart());
