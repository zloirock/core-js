// Replacing the constructor slot invalidates its static method's original return type.
const source = [Array];
source[0] = { from: () => 'abc' };
for (const [{ from, ...rest }] of [source]) consume(from().at(-1), rest);
