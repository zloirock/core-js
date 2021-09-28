var $isNaN = isNaN;
var ceil = Math.ceil;
var floor = Math.floor;

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
module.exports = function (argument) {
  return $isNaN(argument = +argument) || argument === 0 ? 0 : (argument > 0 ? floor : ceil)(argument);
};
