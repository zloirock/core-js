// numeric / bigint literal computed-key access on a class with such keys. memberKeyName
// in class-walk recognises StringLiteral / Literal-string / Identifier; numeric / bigint
// keys aren't covered (numeric and bigint can be used in computed positions but not in
// known prototype symbols). polyfill must not be triggered for these
const x = obj[42];
const y = obj[1n];
x; y;
