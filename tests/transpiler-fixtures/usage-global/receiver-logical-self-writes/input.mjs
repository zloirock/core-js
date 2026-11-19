// Repeated logical assignments keep all possible receiver families.
let value = input;
value = value || first;
value = value || second;
value = value || third;
export const result = value.includes(7);
