// A mixed string and number enum needs generic dispatch when its own method is read.
enum Mixed { A = 'a', B = 1 }
declare const x: Mixed;
const arr: string[] = ['a', 'b'];
arr.at(x as any);
// @ts-expect-error probe a method absent from at least one enum member
typeof x.at;
