// eslint-disable-next-line strict -- The host is CommonJS; the e2e lint scope assumes ESM.
'use strict';
// Give CommonJS's top-level receiver the realm slots the transform assumes. Keep these writes
// on exports so the reads under test have no explicit mutation of their this-rooted slots.
exports.Array = Array;
exports.String = String;
exports.sibling = 'kept';
let userReads = 0;
Object.defineProperty(exports, 'Data', {
  configurable: true,
  get() {
    userReads++;
    return [1, 2];
  },
});
exports.data = 'xy';
exports.userReads = () => userReads;

exports.readArray = (at, sibling) => {
  ({ Array: { prototype: { at } }, sibling } = this);
  return { at, sibling };
};

exports.readString = (at, sibling) => {
  ({ String: { prototype: { at } }, sibling } = this);
  return { at, sibling };
};

exports.readDefault = (fallback, at, sibling) => {
  ({ Array: { prototype: { at = fallback() } }, sibling } = this);
  return { at, sibling };
};

exports.readPrefixed = (before, at, sibling) => {
  ({ Array: { prototype: { at } }, sibling } = (before(), this));
  return { at, sibling };
};

exports.readPrefixedDeclaration = before => {
  const { Array: { prototype: { at } } } = (before(), this);
  return at;
};

exports.readLoop = () => {
  let method;
  for (const { String: { prototype: { at } } } of [this]) method = at;
  return method;
};

exports.readUserArray = () => {
  const { Data: { at }, sibling } = this;
  return { at, sibling };
};

exports.readUserString = at => {
  ({ data: { at } } = this);
  return at;
};

const realm = this;
exports.readCapturedUser = () => {
  function read() {
    const { Data: { at } } = realm;
    return at;
  }
  return read();
};

exports.readPrefixedUser = before => {
  const { Data: { at } } = (before(), this);
  return at;
};

exports.readUserLoop = () => {
  let method;
  for (const { Data: { at } } of [this]) method = at;
  return method;
};
