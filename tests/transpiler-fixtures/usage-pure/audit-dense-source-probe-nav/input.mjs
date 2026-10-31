// a DENSE spelling of the guard family: no spaces around operators, statements packed onto one
// line, the export list carried by ASI. the same source must render the same guard whether or
// not a human formatted it - every other fixture here is formatted, which would hide a
// whitespace assumption
globalThis.denseBox={list:['ab','cd'],n:4};let k=0
export const plain=globalThis.window?.self.denseBox.list?.at(0);export const layer=(globalThis.window?.self.denseBox).list?.at(0)
export const seq=('x',globalThis.window?.self.denseBox.list)?.at(0);export const key=globalThis.window?.self.denseBox.list[(k++,'at')](0)
export const claim=globalThis.window?.self.Array.of(1).at(0);export const chain=globalThis.window?.self.denseBox.list?.at(0)?.slice(0).length
let a=[1]
a
;(globalThis.window?.self.denseBox.list??[]).forEach(function(){})
export{k,a}
