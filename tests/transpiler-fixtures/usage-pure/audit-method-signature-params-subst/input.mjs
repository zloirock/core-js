// method signature params reference outer alias type-params; subst must walk into params
// just like returnType / value slots (parser-shape: TSMethodSignature carries `params`)
type Bag<T> = {
  push(x: T): T[];
};
declare const b: Bag<number>;
const r = b.push(1);
r.at(0);
