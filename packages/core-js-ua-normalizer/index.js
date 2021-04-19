'use strict';
const Parser = require('ua-parser-js');

const parser = new Parser();

class Browser {
  constructor(engine, version = '0') {
    this.engine = engine;
    this.version = version;
  }
  toString() {
    return this.engine ? `${ this.engine } ${ this.version }` : '> 0%';
  }
  toTarget() {
    return this.engine ? { [this.engine]: this.version } : null;
  }
}

// experimental playground
module.exports = function (ua) {
  parser.setUA(ua);
  const { browser, engine, os } = parser.getResult();
  if (engine.name === 'WebKit' && os.name === 'iOS') return new Browser('ios', os.version);
  switch (browser.name) {
    case 'Chrome': return new Browser('chrome', browser.version);
    case 'IE': return new Browser('ie', browser.version);
    case 'Safari': return new Browser('safari', browser.version);
  }
  switch (engine.name) {
    case 'Blink': return new Browser('chrome', engine.version);
    case 'EdgeHTML': return new Browser('edge', engine.version);
    // wrong for 4-
    case 'Gecko': return new Browser('firefox', engine.version);
  }
  if (engine.name === 'Presto' && browser.name === 'Opera') return new Browser('opera', browser.version);
  return new Browser();
};
