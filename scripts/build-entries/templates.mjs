import dedent from 'dedent';

const t = template => declared => processed => `'use strict';\n${ template({ ...processed, ...declared }) }\n`;

const importInternal = (module, level) => `require('${ level ? '../'.repeat(level) : './' }internals/${ module }');`;

const importModule = (module, level) => `require('${ level ? '../'.repeat(level) : './' }modules/${ module }');`;

const importModules = (modules, level) => modules.map(it => importModule(it, level)).join('\n');

export const $justImport = t(p => importModules(p.modules, p.level))();

export const $virtual = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var getBuiltInPrototypeMethod = ${ importInternal('get-built-in-prototype-method', p.level) }

  module.exports = getBuiltInPrototypeMethod('${ p.namespace }', '${ p.method }');
`);

export const $prototype = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var entryUnbind = ${ importInternal('entry-unbind', p.level) }

  module.exports = entryUnbind('${ p.namespace }', '${ p.method }');
`);

export const $static = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var path = ${ importInternal('path', p.level) }

  module.exports = path.${ p.namespace }.${ p.method };
`);

export const $patchableStatic = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var getBuiltInStaticMethod = ${ importInternal('get-built-in-static-method', p.level) }
  var apply = ${ importInternal('apply', p.level) }

  module.exports = function () {
    return apply(getBuiltInStaticMethod('${ p.namespace }', '${ p.method }'), this, arguments);
  };
`);

export const $patchableStaticWithContext = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var getBuiltIn = ${ importInternal('get-built-in', p.level) }
  var getBuiltInStaticMethod = ${ importInternal('get-built-in-static-method', p.level) }
  var isCallable = ${ importInternal('is-callable', p.level) }
  var apply = ${ importInternal('apply', p.level) }

  module.exports = function () {
    return apply(
      getBuiltInStaticMethod('${ p.namespace }', '${ p.method }'),
      isCallable(this) ? this : getBuiltIn('${ p.namespace }'),
      arguments
    );
  };
`);

export const $namespace = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var path = ${ importInternal('path', p.level) }

  module.exports = path.${ p.name };
`);

export const $helper = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var $export = ${ importInternal(p.name, p.level) }

  module.exports = $export;
`);

export const $path = $helper({ name: 'path' });
