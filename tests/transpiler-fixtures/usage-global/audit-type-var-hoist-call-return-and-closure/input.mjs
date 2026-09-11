// the type can also arrive through a CALL on the hoisted binding (its return annotation) or through a
// closure that reads it - two distinct descents, a method each
declare const objSrc: {
  v: string[];
};
declare function mkArr(): string[];

export function viaCallReturn() {
  {
    var make = mkArr;
  }
  {
    return make().at(0);
  }
}

export function viaClosureField() {
  {
    var owner = objSrc;
  }
  {
    return (() => owner.v)().includes("x");
  }
}
