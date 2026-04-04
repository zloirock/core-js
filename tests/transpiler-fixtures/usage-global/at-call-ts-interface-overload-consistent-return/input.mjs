interface Parser {
  parse(x: string): string;
  parse(x: number): string;
  parse(x: boolean): string;
}
declare const p: Parser;
p.parse(true).at(-1);
