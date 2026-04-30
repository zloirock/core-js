// Interface default type-param: `interface I<T = string[]>` referenced as bare `I` — does the default propagate so `obj.x.at(0)` resolves to Array via findTypeMember?
interface I<T = string[]> {
  x: T;
}
declare const obj: I;
obj.x.at(0);
