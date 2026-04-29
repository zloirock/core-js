// cyclic generic default `type R<T = R<T>>`: substitution не должен зацикливаться
// и не должен пожирать MAX_DEPTH стек. cycle-detect side-channel должен trip'нуться
// raньше через переданный `seen` argument
type R<T = R<T>> = { value: T };
declare const x: R<number[]>;
x.value.at(-1);
