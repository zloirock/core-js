{
// Read the nested method once before evaluating the following computed key and reading its property.
function key() { return 'k'; } const { m: { at }, [key()]: picked } = { m: [1], k: 2 };
}
