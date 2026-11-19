import _globalThis from "@core-js/pure/actual/global-this";
// A prefix write names the realm at the following read, without admitting an effectful hop.
let realm;
export const {
  Array: {
    from
  }
} = (prefix(), realm = _globalThis, realm)[key(), 'self'];