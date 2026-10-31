import _at from "@core-js/pure/actual/instance/at";
// `ThisParameterType` of a method nothing resolves is a receiver nothing is known about, served
// generically - not one known to declare no `this`, which would read as a plain object
interface Formatter {
  format(this: string[]): string;
}
export function lastPart(formatter: Formatter, parts: ThisParameterType<typeof formatter.format>) {
  return _at(parts).call(parts, -1);
}