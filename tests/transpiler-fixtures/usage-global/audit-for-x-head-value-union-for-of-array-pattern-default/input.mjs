// a slot DEFAULT is a possible value too (fires on the undefined element)
let D = Object;
for ([D = Symbol] of [[undefined]]) { break; }
