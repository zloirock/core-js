// numeric enum - each member has an implicit integer initialiser, so `c: Color` narrows
// to `number`. using the enum value as an array index (`arr.at(c)`) is valid: `.at` accepts
// a number, and the array's element type (`string[]`) picks the String-index-return path
enum Color { Red, Green, Blue }
declare const c: Color;
const arr: string[] = ['a', 'b', 'c'];
arr.at(c);
