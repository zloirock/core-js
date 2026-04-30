// decorator argument with deep instance polyfill chain: `arr.includes(arr.at(0))`.
// decorator visitor must polyfill BOTH arr.includes (outer) and arr.at (inner argument)
// without dropping either. tests interaction between decorator visitor and instance method
// rewrite when the decorator arg contains nested polyfillable expressions.
@dec(arr.includes(other.at(0)))
class C {}
