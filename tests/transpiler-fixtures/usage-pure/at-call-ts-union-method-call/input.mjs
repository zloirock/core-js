interface A { read(): number[]; }
interface B { read(): number[]; }
declare const x: A | B;
x.read().at(0);
