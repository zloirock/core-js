// A disabled caller source stays native through a plain parameter member read.
// core-js-disable-next-line
export const r = (value => value.resolve)(Promise // core-js-disable-line
);