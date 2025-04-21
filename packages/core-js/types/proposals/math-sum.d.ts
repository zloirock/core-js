// proposal stage: 3
// https://github.com/tc39/proposal-math-sum
declare module 'core-js-pure/actual/math/sum-precise' {
  function sumPrecise(...values: number[]): number;
  export default sumPrecise;
}

declare module 'core-js-pure/full/math/sum-precise' {
  function sumPrecise(...values: number[]): number;
  export default sumPrecise;
}

interface Math {
  sumPrecise(...values: number[]): number;
}
