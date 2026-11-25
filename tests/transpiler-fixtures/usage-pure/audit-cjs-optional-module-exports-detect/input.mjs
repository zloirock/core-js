// The optional read is the only CommonJS marker. Both polyfills must use require.
const guard = module?.exports;
consume(guard, [1, 2, 3].flat(), ['a', 'b'].at(0));
