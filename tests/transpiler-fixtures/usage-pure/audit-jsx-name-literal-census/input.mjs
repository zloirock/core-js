// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
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
