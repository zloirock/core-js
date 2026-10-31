import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `typeof X` is the type X is declared or asserted with, not the literal it happens to hold: a key the
// literal omits can still carry another family, so the fold over a wider declared type stays generic
interface Config {
  items: number[];
  label?: string;
}
const declared: Config = {
  items: [1]
};
export function firstOfDeclared(value: typeof declared[keyof typeof declared]) {
  return _at(value!).call(value!, 0);
}
interface Tags {
  names: string[];
  note?: string;
}
const asserted = {
  names: ['a']
} as Tags;
export function hasAInAsserted(value: typeof asserted[keyof typeof asserted]) {
  return _includes(value!).call(value!, 'a');
}