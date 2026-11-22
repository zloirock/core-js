'use strict';
// -0, -0.5 and alike; anything but a number or `undefined` could turn into them only through its conversion
module.exports = function (argument) {
  return typeof argument == 'number' ? argument > -1 && 1 / argument < 0 : argument !== undefined;
};
