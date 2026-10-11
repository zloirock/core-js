// A write a later unconditional write overwrites before the read, or before a closure reading the name
// is even defined, installs nothing the read observes: in usage-global its constructor's static stays
// out. The earlier write stays where the read may still see it: a write after the closure's definition,
// one under an undecided test, a function writing a binding it does not declare, a class key ahead of a
// static field
let inClosure = null;
inClosure = Object;
inClosure = Map;
export const closureRead = () => inClosure.groupBy([1], x => x);
let inPlace = null;
inPlace = Reflect;
inPlace = Object;
export const placeRead = inPlace.isExtensible(1);
let afterDefinition = null;
export const lateRead = () => afterDefinition.from([1]);
afterDefinition = Array;
afterDefinition = Iterator;
let undecided = null;
undecided = Array;
if (flag) undecided = Int8Array;
export const guardedRead = () => undecided.of(1);
let rebound = null;
export function rebind() {
  rebound = Reflect;
  rebound = Object;
  return () => rebound.has({}, 'x');
}
let early = null;
early = Reflect;
export class Holder {
  static late = (early = Math, 1);
  static [early.ownKeys({}).length] = 2;
}
