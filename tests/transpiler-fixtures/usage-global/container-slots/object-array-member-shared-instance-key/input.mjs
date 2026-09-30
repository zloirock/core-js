// An object member preserves its array receiver type for a method shared with strings.
const host = { value: [1, 2] };
const { 'at': at } = host.value;
export { at };
