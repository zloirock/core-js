// A disabled sibling stays native without suppressing the enabled method.
export function read({ at,
  // core-js-disable-next-line
  flat
}) { return [at, flat]; }
