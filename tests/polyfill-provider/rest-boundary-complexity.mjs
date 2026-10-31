import { patternHasRestReadBeforeNestedBinding } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, checkTruthy, finish, runBoth } = createChecker('rest-boundary-complexity');

// Sibling claims ask about one source pattern. Count property visits: repeating a
// negative scan per leaf is quadratic even though it never changes printed output.
for (const size of [8, 32, 80]) for (const boundary of [false, true]) {
  const properties = Array.from({ length: size }, (unused, i) => `at: a${ i }`).join(', ');
  const suffix = boundary ? ', [key]: other, Array: { of }, ...rest' : '';
  runBoth(
    `${ size }/${ boundary }`,
    `const [{ ${ properties }${ suffix } }] = [source];`,
    (parser, program, label) => {
      const pattern = parser.pickPath(program, 'ArrayPattern').node;
      const [object] = pattern.elements;
      let reads = 0;
      object.properties = new Proxy(object.properties, {
        get(target, key, receiver) {
          if (typeof key === 'string' && /^\d+$/.test(key)) reads++;
          return Reflect.get(target, key, receiver);
        },
      });
      const adapter = {};
      for (let i = 0; i < size; i++) {
        check(`${ label }/host ${ i }`, patternHasRestReadBeforeNestedBinding(pattern, adapter), boundary);
        check(`${ label }/leaf ${ i }`, patternHasRestReadBeforeNestedBinding(object, adapter), boundary);
      }
      checkTruthy(`${ label }/linear and non-vacuous`, reads >= size && reads <= 2 * (size + 3));
      const firstReads = reads;
      check(`${ label }/new instance`, patternHasRestReadBeforeNestedBinding(pattern, {}), boundary);
      checkTruthy(`${ label }/new instance scans its own source`, reads > firstReads);
      // Source admission survives internal pruning; a rebuilt host is a new source.
      object.properties = [];
      check(`${ label }/original admission`, patternHasRestReadBeforeNestedBinding(pattern, adapter), boundary);
      check(`${ label }/replacement`, patternHasRestReadBeforeNestedBinding({ ...object }, adapter), false);
      check(`${ label }/fresh pass sees current syntax`, patternHasRestReadBeforeNestedBinding(pattern, {}), false);
    },
  );
}
finish();
