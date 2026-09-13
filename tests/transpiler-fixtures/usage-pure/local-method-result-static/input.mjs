// A fixed local method returns a constructor. Only the selected static is required;
// the method call and its effects remain at the original read position.
const source = { read() { effect(); return Map; } };
export const method = source.read().groupBy;
