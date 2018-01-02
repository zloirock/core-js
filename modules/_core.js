var version = [
  '2.5.1',
  require('./_is-ponyfill') ? 'ponyfill' : 'global',
  '© 2018 Denis Pushkarev (zloirock.ru)'
];

require('./_shared')('versions', []).push(version);

module.exports = { version: version };
