// calling a getter is two steps: read the property, then invoke what it returned. for a getter with
// a body the resolver already does both; a DECLARED getter carries only its return annotation, and
// reading that as a method return type answers with the function itself, which suppresses the
// polyfill on the call result. both spellings of a bodyless getter are here because the parsers
// model them differently. distinct method per row
declare class Declared {
  get a(): () => number[];
  get b(): () => string;
}
declare const d: Declared;
d.a().includes(1);
d.b().at(0);
