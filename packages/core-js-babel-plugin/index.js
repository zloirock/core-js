'use strict';
const { default: defineProvider } = require('@babel/helper-define-polyfill-provider');

module.exports = defineProvider(() => {
  return {
    name: 'core-js@4',
    entryGlobal() { /* empty */ },
    usageGlobal() { /* empty */ },
    usagePure() { /* empty */ },
  };
});
