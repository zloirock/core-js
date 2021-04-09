'use strict';
const { version } = require('./package');

module.exports = {
  /* eslint-disable prefer-template -- for better formatting */
  banner: '/**\n' +
          ' * core-js ' + version + '\n' +
          ' * https://github.com/zloirock/core-js\n' +
          ' * © ' + new Date().getFullYear() + ' Denis Pushkarev (zloirock.ru)\n' +
          ' */',
  /* eslint-enable prefer-template -- for better formatting */
};
