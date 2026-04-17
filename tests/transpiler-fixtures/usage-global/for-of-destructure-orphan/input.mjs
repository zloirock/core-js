// `from` here is destructured from the Array constructor itself (Array.from),
// but used only as a binding, never invoked - polyfill must not be injected
for (var { from } of [Array]) {
  record(from);
}
