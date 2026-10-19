// `t[k]` where `k: keyof T` reads a key of whatever T the caller passed, and a subtype may add
// keys of another family to the ones its constraint names - so the read stays generic, as tsc
// leaves it; a constraint with a `string` index signature bounds every key and still narrows
function f<T extends { a: string[]; b: string[] }>(t: T, k: keyof T) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return t[k].at(0);
}
f({ a: ['x'], b: ['y'] }, 'a');
