// An arbitrary keyof can reach a symbol property outside the string index signature.
function f<T extends { [key: string]: string[] }>(t: T, k: keyof T) {
  return t[k].at(0);
}
function g<T extends Record<string, string>>(t: T, k: keyof T) {
  return t[k].includes('a');
}

function bounded<T extends Record<PropertyKey, string>>(t: T, k: keyof T) {
  return t[k].includes('a');
}
