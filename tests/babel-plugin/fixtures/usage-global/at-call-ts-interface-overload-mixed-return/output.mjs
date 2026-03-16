import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
interface Parser {
  parse(x: string): string[];
  parse(x: number): string;
}
declare const p: Parser;
p.parse('a').at(-1);