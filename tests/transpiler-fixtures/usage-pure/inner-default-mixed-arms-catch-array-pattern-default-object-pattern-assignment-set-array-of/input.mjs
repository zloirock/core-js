let caughtSet, caughtOf;
try {
  throw [];
} catch ([{ Set: S, Array: { of } } = globalThis]) {
  caughtSet = S;
  caughtOf = of;
}
export { caughtSet };
export { caughtOf };
