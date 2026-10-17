import _at from "@core-js/pure/actual/instance/at";
// `typeof input === \`${tag}ring\`` builds the type string from a template with a
// runtime expression. the comparison can't fold to a single literal at static
// analysis time, so `input.at(0)` falls back to generic dispatch
declare const tag: 'st' | 'nu';
function take(input: unknown) {
  if (typeof input === `${tag}ring`) {
    return _at(input).call(input, 0);
  }
  return null;
}