extendBuiltInObject(RegExp[prototype], {
  fn: RegExpToFunction,
  getFlags: getRegExpFlags
});