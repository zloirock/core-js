let foreignSetter = {};
myLib.setPrototypeOf(foreignSetter, Array.prototype);
export const j = foreignSetter.toReversed();
