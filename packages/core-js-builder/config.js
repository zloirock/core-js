'use strict';
const { version } = require('./package');

module.exports = {
  /* eslint-disable prefer-template -- for better formatting */
  banner: '/**\n' +
          ' * core-js ' + version + '\n' +
          ' * © 2014-2023 Denis Pushkarev (zloirock.ru)\n' +
          ' * license: https://github.com/zloirock/core-js/blob/v' + version + '/LICENSE\n' +
          ' * source: https://github.com/zloirock/core-js\n' +
          ' */',
  /* eslint-enable prefer-template -- for better formatting */
};
