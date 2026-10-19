import _globalThis from "@core-js/pure/actual/global-this";
// `typeof` always yields a string - the member narrows and the string method polyfills
// @ts-expect-error an enum member tsc refuses is the shape under test
enum E4 {
  T = typeof _globalThis
}