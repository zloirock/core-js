import _includes from "@core-js/pure/actual/instance/includes";
// Repeated logical assignments keep all possible receiver families.
let value = input;
value = value || first;
value = value || second;
value = value || third;
export const result = _includes(value).call(value, 7);