import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.includes";
import "core-js/modules/web.self";
// the probe nav as a WRITE target: every slot that takes a reference rather than a value. the guard
// renders the same way it does in a read, and the write lands on the object the guard yields - a
// fold into the alternate would write to the short-circuit value instead
globalThis.writeBox = {
  n: 1,
  list: ['ab', 'cd']
};
// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.writeBox.list ? 0 : 1)?.includes('a');