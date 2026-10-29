// The guarded delete keeps its reference and evaluates the key only on the live branch.
export function remove() {
  return delete globalThis.window?.self.guardTailBox[(Array.of(3)[0], 'kept')];
}
