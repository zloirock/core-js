export function read() {
  return (0, (0, globalThis.window.self))?.Math.PI;
}

export function optional() {
  return (0, (missingPrefix, globalThis.self))?.Math.PI;
}

export function alias() {
  const realm = globalThis;
  return (0, (0, realm.self)).Math.PI;
}

export function destructure() {
  const { self: { Array: A } } = (missingPrefix, globalThis);
  const { Map: M, user } = (later, globalThis);
  let later;
  return [A, M, user];
}
