// function param destructure with default that combines a SequenceExpression and a TS cast:
//   `function probe({ from } = (logCall(), Array) as any)`.
// synth-swap should rewrite only the inner `Array` Identifier as the receiver while
// preserving the SequenceExpression side-effect prefix and the outer cast
declare function logCall(): void;
function probe({ from } = (logCall(), Array) as any) {
  return from([1]);
}
export { probe };
