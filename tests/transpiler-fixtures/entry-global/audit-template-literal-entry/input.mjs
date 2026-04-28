// no-interpolation TemplateLiteral as require()-arg: must be recognised as an entry
// the same as a StringLiteral. Pre-fix `getStringValue` returned null on TemplateLiteral
// so the entry was silently ignored
require(`core-js/actual/promise`);
