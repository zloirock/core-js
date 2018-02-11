var version = [
  '3.0.0-alpha.1',
  require('../internals/is-pure') ? 'pure' : 'global',
  '© 2018 Denis Pushkarev (zloirock.ru)'
];

require('../internals/shared')('versions', []).push(version);

module.exports = { version: version };
