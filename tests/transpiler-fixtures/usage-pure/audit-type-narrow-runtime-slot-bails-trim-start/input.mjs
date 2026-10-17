// `typeof` always yields a string - the member narrows and the string method polyfills
enum E4 { T = typeof globalThis }
use(E4.T.trimStart());
