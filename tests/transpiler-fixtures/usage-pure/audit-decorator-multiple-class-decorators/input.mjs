// multiple class decorators stacked. each decorator's argument may carry independent
// polyfillable expressions. decorator visitor must walk all three without skipping.
@dec1(arr.at(0))
@dec2(other.includes(z))
@dec3(Promise.resolve(0))
class C {}
