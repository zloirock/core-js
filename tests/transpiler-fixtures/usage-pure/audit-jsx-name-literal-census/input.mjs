// The negative half of the same rule: a JSX name that lowers to a STRING names no binding, so it is
// no caller and the caller-lossy extract stays sound. Four slots spell such a name - a lowercase-
// initial bare tag, an attribute name, a member tag's tail, and either half of a namespaced name -
// and each row here is reachable through that slot alone.
function div({ values, ...rest } = Object) {
  return [values, rest];
}

function Attr({ assign, ...rest } = Object) {
  return [assign, rest];
}

function Tail({ entries, ...rest } = Object) {
  return [entries, rest];
}

function Ns({ all, ...rest } = Promise) {
  return [all, rest];
}

function NsAttr({ race, ...rest } = Promise) {
  return [race, rest];
}

// CONTROL: a bare tag naming this one, so the file also exercises the verbatim verdict it pins.
function Referenced({ from, ...rest } = Array) {
  return [from, rest];
}

export const elements = [
  <div x={1} />,
  <Other Attr={1} />,
  <Other.Tail x={1} />,
  <Ns:x y={1} />,
  <Other z:NsAttr={1} />,
  <Referenced x={1} />,
];
