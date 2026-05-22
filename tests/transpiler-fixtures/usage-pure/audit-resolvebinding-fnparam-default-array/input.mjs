// Function param with an explicit annotation and a default value (`items: string[] = []`):
// the annotation narrows the binding to array. Distinct array-instance methods on each
// line, so each emitted polyfill maps to its source call.
function step(items: string[] = []) {
  items.findLast(s => s);
  items.at(0);
  items.includes('z');
}
step(['a', 'b']);
