type Inner = (number[]);
type Outer = Inner;
declare const chained: Outer;
chained.includes(4);
