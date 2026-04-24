// computed [Symbol.iterator]() emits a CallExpression polyfill whose range nests inside
// Array.from's arglist - compose loop substitutes the inner get-iterator into outer's content
Array.from(obj[Symbol.iterator]());
