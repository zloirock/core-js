import {
  $justImport, $patchableStatic,
  $uncurried,
  $uncurriedIterator, $static, $staticWithContext,
  $prototype,
  $prototypeIterator,
} from '../../scripts/build-entries-and-types/templates.mjs';
import { deepEqual } from 'node:assert/strict';

const props = {
  modules: ['module1', 'module2'],
  namespace: 'namespace',
  name: 'name',
  level: 2,
  types: ['type1', 'type2'],
  source: 'source',
};

deepEqual(
  $justImport(props),
  { dts: '// it has no exports', entry: "require('../../modules/module1');\nrequire('../../modules/module2');" },
  'Template $justImport incorrect',
);
deepEqual(
  $prototype(props),
  {
    dts: 'declare const method: typeof namespace.prototype.name;\nexport = method;',
    entry: "require('../../modules/module1');\nrequire('../../modules/module2');\n" +
      "\nvar getBuiltInPrototypeMethod = require('../../internals/get-built-in-prototype-method');\n\nmodule.exports = getBuiltInPrototypeMethod('namespace', 'name');",
  },
  'Template $prototype incorrect',
);
deepEqual(
  $prototypeIterator(props),
  {
    dts: 'declare const method: typeof namespace.prototype[typeof Symbol.iterator];\nexport = method;',
    entry: "require('../../modules/module1');\nrequire('../../modules/module2');\n" +
      "\nvar getIteratorMethod = require('../../internals/get-iterator-method');\n\nmodule.exports = getIteratorMethod(source);",
  },
  'Template $prototypeIterator incorrect',
);
deepEqual(
  $uncurried(props),
  {
    dts: 'declare const method: (\n  thisArg: any,\n  ...args: Parameters<typeof namespace.prototype.name>\n) => ReturnType<typeof namespace.prototype.name>;\nexport = method;',
    entry: "require('../../modules/module1');\nrequire('../../modules/module2');\n" +
      "\nvar entryUnbind = require('../../internals/entry-unbind');\n\nmodule.exports = entryUnbind('namespace', 'name');",
  },
  'Template $uncurried incorrect',
);

deepEqual(
  $uncurriedIterator(props),
  {
    dts: 'declare const method: (\n  thisArg: any,\n  ...args: Parameters<typeof namespace.prototype[typeof Symbol.iterator]>\n' +
      ') => ReturnType<typeof namespace.prototype[typeof Symbol.iterator]>;\nexport = method;',
    entry: "require('../../modules/module1');\nrequire('../../modules/module2');\n" +
      "\nvar uncurryThis = require('../../internals/function-uncurry-this');\nvar getIteratorMethod = require('../../internals/get-iterator-method');\n" +
      '\nmodule.exports = uncurryThis(getIteratorMethod(source));',
  },
  'Template $uncurriedIterator incorrect',
);

deepEqual(
  $static(props),
  {
    dts: 'declare const method: typeof namespace.name;\nexport = method;',
    entry: "require('../../modules/module1');\nrequire('../../modules/module2');\n" +
      "\nvar getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');\n\nmodule.exports = getBuiltInStaticMethod('namespace', 'name');",
  },
  'Template $static incorrect',
);

deepEqual(
  $staticWithContext(props), {
    dts: 'declare const method: (\n  this: Function | void,\n  ...args: Parameters<typeof namespace.name>\n) => ReturnType<typeof namespace.name>;\nexport = method;',
    entry: "require('../../modules/module1');\nrequire('../../modules/module2');\n\nvar getBuiltIn = require('../../internals/get-built-in');\n" +
      "var getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');\nvar isCallable = require('../../internals/is-callable');\n" +
      "var apply = require('../../internals/function-apply');\n\nvar method = getBuiltInStaticMethod('namespace', 'name');\n" +
      "\nmodule.exports = function name() {\n  return apply(method, isCallable(this) ? this : getBuiltIn('namespace'), arguments);\n};",
  },
  'Template $staticWithContext incorrect',
);

deepEqual(
  $patchableStatic(props),
  {
    dts: 'declare const method: typeof namespace.name;\nexport = method;',
    entry: "require('../../modules/module1');\nrequire('../../modules/module2');\n\nvar getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');\n" +
      "var apply = require('../../internals/function-apply');\n" +
      "\nmodule.exports = function name() {\n  return apply(getBuiltInStaticMethod('namespace', 'name'), this, arguments);\n};",
  },
  'Template $patchableStatic incorrect',
);

echo(chalk.green('templates tested'));
