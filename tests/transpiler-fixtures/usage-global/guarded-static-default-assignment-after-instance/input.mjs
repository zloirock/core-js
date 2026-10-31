// A queued instance read precedes the static guards of a discarded assignment.
// The live default keeps its claims and source write after the pattern slots retire.
// In pure output, the bindings split adjacent guarded writes into a comma or separate statements.
export function read(source) {
  const effects = [];
  let M = source;
  if (!M) M = Array;
  let first, method, tail;
  ({ name: first, of: method = (effects.push('default'), M = {}, 9), from: tail } = M);
  return [first, method, tail, effects];
}
