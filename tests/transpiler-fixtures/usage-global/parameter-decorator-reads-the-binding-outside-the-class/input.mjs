// a parameter decorator is evaluated where the class is defined, outside the decorated function, so neither
// the decorated parameter nor a body declaration of the same name shadows what it reads: the read reaches
// the binding declared outside the class - a user value, never the global
const Map = MyMap;
export class Injected { constructor(@inject(new Map()) Map: any) {} }
const Promise = Local;
export class Resolved { m(@dec(Promise.resolve(1)) p: any) { const Promise = 1; return [p, Promise]; } }
const s = 'abc';
export class Typed { m(@dec(s.at(-1)) s: number[]) { return s; } }
