'use strict';
const { version } = require('./package');

module.exports = {
  /* eslint-disable prefer-template */
  banner: '/**\n' +
          ' * core-js ' + version + '\n' +
          ' * https://github.com/zloirock/core-js\n' +
          ' * License: http://rock.mit-license.org\n' +
          ' * © ' + new Date().getFullYear() + ' Denis Pushkarev (zloirock.ru)\n' +
          ' */',
  /* eslint-enable prefer-template */
};
