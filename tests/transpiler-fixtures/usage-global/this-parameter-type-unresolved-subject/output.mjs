import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// `ThisParameterType` of a method nothing resolves is a receiver nothing is known about, served
// generically - not one known to declare no `this`, which would read as a plain object
interface Formatter {
  format(this: string[]): string;
}
export function lastPart(formatter: Formatter, parts: ThisParameterType<typeof formatter.format>) {
  return parts.at(-1);
}