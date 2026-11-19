globalThis.scriptBox = { list: ['ab', 'cd'], n: 7 };
// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
var typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.scriptBox.list ? 0 : 1) != null
  && ['ab', 'cd'].at(0).includes('a');
module.exports.typedNarrowing = typedNarrowing;
