// A disabled caller source stays native through a plain parameter member read.
export const r = (value => value.resolve)(
  Promise // core-js-disable-line
);
