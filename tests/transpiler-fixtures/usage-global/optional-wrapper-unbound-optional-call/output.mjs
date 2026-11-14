// An absent optional callee short-circuits the following realm-like member reads.
export function read(choice) {
  const effects = [];
  let f: any;
  return f?.()?.self.box;
}