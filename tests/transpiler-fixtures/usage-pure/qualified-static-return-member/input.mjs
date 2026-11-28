namespace NS3 { export class Cls { static make(x) { return [1, 2, 3]; } } }
declare const m3: typeof NS3.Cls;
m3.make(0).at(-1);
