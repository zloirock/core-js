import _at from "@core-js/pure/actual/instance/at";
declare const tag: 'st' | 'nu';
function take(input: unknown) {
  if (typeof input === `${tag}ring`) {
    return _at(input).call(input, 0);
  }
  return null;
}