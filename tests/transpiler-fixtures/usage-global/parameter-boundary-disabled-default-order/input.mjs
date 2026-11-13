// A disabled getter stays after the earlier leaf default.
export function read({ at, missing = effect(),
  // core-js-disable-next-line
  flat
} = [3, 7]) { return [at, missing, flat]; }
