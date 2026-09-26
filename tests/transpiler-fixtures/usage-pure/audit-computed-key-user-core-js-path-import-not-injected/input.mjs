// The import path does not prove its value is a safe mirror key.
// The declaration retains that key and guards the named static on its selected receiver.
import KEY from 'a-core-js-helper';

export function pick(cond) {
  const { [KEY]: own, from } = cond ? Array : Set;
  return [own, from];
}
