import _at from "@core-js/pure/actual/instance/at";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a `typeof`-OR group is parsed in the test's own scope like any other test: a user-shadowed
// `Number` is no built-in there, so its `.isFinite` contributes no `number` disjunct and the group
// narrows nothing - the union stays whole and the generic helper dispatches. the same shadow
// outside an OR group already declined - its receiver is left OPEN so a firing guard would narrow it
// to `number` and drop the helper entirely, which a `string | number[]` annotation could not show
// (a fired `number` guard leaves no survivor there and falls back to the same generic answer as a
// declining one); the unshadowed group beside it (the built-in reached
// through the realm object) narrows to string and number, so the string arm alone survives
const Number = {
  isFinite: (v: unknown) => true
};
export function shadowed(x: string | number[]) {
  if (typeof x === 'string' || Number.isFinite(x)) return _at(x).call(x, 0);
  return null;
}
export function plain(x) {
  if (Number.isFinite(x)) return _at(x).call(x, 1);
  return null;
}
export function unshadowed(x: string | number[]) {
  if (typeof x === 'string' || _Number$isFinite(x as any)) return _includesMaybeString(x).call(x, 'a');
  return null;
}