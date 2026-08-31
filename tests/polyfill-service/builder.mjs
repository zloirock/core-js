import { ok, strictEqual } from 'node:assert/strict';
import { createContext, runInContext } from 'node:vm';
import createBuilder from '../../packages/core-js-polyfill-service/internals/infrastructure/builder.js';

const build = createBuilder({ minify: true });
const modules = ['es.array.at', 'es.object.group-by'];

// the whole target set of the bucket goes to the builder, never a representative. `targets`
// decides two things at once in there - which modules are kept and whether the syntax is downleveled
// - and there is no order between versions of different engines to pick a lowest from
const forOld = await build({ modules, targets: { ie: '11' } });
const forBoth = await build({ modules, targets: { chrome: '120', ie: '11' } });
const forNew = await build({ modules, targets: { chrome: '120' } });

ok(forOld.length > 1024, 'builder-1 #1');
// adding a stronger engine to the bucket changes nothing: the weakest still decides
strictEqual(forBoth.length, forOld.length, 'builder-1 #2');
// and the strong engine on its own needs none of it, which is what makes the comparison mean
// something
ok(forNew.length < forOld.length / 4, 'builder-1 #3');

// an old bucket never receives syntax its engine cannot read. this does not hold because of any
// code here - it holds because `ModernSyntax` in the builder lists what rolldown emits. Should
// rolldown start emitting something newer, the engine fails to parse THE WHOLE FILE
ok(!/=>/.test(forOld), 'builder-2 #1');
ok(!/\bconst\b/.test(forOld), 'builder-2 #2');
ok(!/`/.test(forOld), 'builder-2 #3');

// an empty bucket is an ordinary bucket: a bundle with nothing in it, not a missing bundle
const empty = await build({ modules: [], targets: { chrome: '120' } });

ok(empty.length > 0 && empty.length < 1024, 'builder #1');

// the bytes are a working bundle, not just a string that looks like one
const context = createContext({});

runInContext('var Array = globalThis.Array; delete Array.prototype.at; delete Object.groupBy;', context);
runInContext(forOld, context);

strictEqual(runInContext('typeof Array.prototype.at', context), 'function', 'builder #2');
strictEqual(runInContext('[1, 2, 3].at(-1)', context), 3, 'builder #3');
