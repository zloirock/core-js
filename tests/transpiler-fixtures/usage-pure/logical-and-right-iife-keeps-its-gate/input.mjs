// An undecided `&&` keeps the right IIFE under the gate. A false left skips the call and yields
// `from === undefined`; a truthy left runs the call once and serves Array.from.
export function read(enabled) {
  let calls = 0;
  const { from } = enabled && (() => { calls++; return Array; })();
  return [from, calls];
}
