'use strict';
const { version } = require('./package');

module.exports = {
  /* eslint-disable prefer-template -- for better formatting */
  banner: '/**\n' +
          ' * core-js ' + version + '\n' +
          ' * https://github.com/zloirock/core-js\n' +
          ' * License: http://rock.mit-license.org\n' +
          ' * © 2014-2022 Denis Pushkarev (zloirock.ru)\n' +
          ' */',
  /* eslint-enable prefer-template -- for better formatting */
};
