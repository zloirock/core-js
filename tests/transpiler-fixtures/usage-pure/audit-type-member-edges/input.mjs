// type-member edges: a no-subst conditional takes the structurally PICKED branch (folding
// both leaked the dead branch); an empty-string key is a valid static name; a getter called
// AS a method is not callable (generic), while reading it keeps the value narrow
type P<X> = X extends string ? string[] : number[];
declare const v: P<'a'>;
v.at(0);
declare const obj: { '': string[] };
obj[''].at(1);
interface I { get items(): number[] }
declare const i: I;
i.items.at(2);
