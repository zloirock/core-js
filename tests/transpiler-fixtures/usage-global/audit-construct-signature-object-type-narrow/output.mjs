import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// Construct signatures determine the new receiver, independently of call signatures.
// Array and string methods distinguish the two constructed families.
type Make<T> = {
  new (): T[];
};
declare const makeArray: Make<string>;
export const a = new makeArray().at(0);
interface MakeString {
  new (): string;
}
declare const makeString: MakeString;
export const b = new makeString().includes("x");