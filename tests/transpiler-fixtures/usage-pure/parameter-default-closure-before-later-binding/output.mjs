import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// A receiver getter may invoke an earlier closure before a later parameter is initialized.
// Keep that read in parameter initialization, where the later binding is still in TDZ.
export function read(probe = () => later, {
  at
} = {
  get at() {
    return probe();
  }
}, later) {
  return at;
}
export let result;
try {
  result = read();
} catch (error) {
  result = _nameMaybeFunction(error);
}