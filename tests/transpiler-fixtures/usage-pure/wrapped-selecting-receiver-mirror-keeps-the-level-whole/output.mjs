// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
const [{
  hasOwn: viaSpreadShift
}] = [...[c ? Object : userObj]];
const [, {
  getOwnPropertyNames: viaSpreadAhead
}] = [...[0], c ? Object : userObj];
const {
  w: {
    is: viaSpreadLevel
  }
} = {
  w: c ? Object : userObj,
  ...more
};
const {
  w: {
    freeze: viaLaterKey
  }
} = {
  w: c ? Object : userObj,
  [k]: 1
};
const [{
  isFrozen: viaSpreadAlias
}] = [...wrapped];
const {
  w: {
    isSealed: viaGetterLast
  }
} = {
  w: c ? Object : userObj,
  get w() {
    return userObj;
  }
};
export { viaSpreadShift, viaSpreadAhead, viaSpreadLevel, viaLaterKey, viaSpreadAlias, viaGetterLast };