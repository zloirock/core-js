// A numeric enum is an argument to the array call. Reading its own at leaves the Number receiver alone.
enum Color { Red, Green, Blue }
declare const c: Color;
const arr: string[] = ['a', 'b', 'c'];
arr.at(c);
// @ts-expect-error probe a method absent from at least one enum member
typeof c.at;
