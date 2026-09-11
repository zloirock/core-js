// a chain-assignment buried under the member leaf of a discarded init: rescued WHOLE ahead of
// the extraction - the binding update survives the flatten (it was once silently dropped)
let a;
const [{
  from
}] = [(a = globalThis).Array];
