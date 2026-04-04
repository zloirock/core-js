type Branded = string & { __brand: true } & { __tag: "x" };
const x: Branded = "hello" as Branded;
x.at(0);
