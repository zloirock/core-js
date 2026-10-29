// zod 3: object, union, transform, refine and coercion schemas parsed and their issues read. Expected
// values come from the input - parsed data, issue paths - and from zod's issue codes.
//
// Its reason is the SYNTAX axis: six of its schema classes construct through `super(...arguments)`,
// spreading into a super call, and `ZodError` restores its prototype through `new.target` - forms no
// other library here spells. V8 coverage of a native run counts 2 of the six super spreads and the one
// `new.target` executed.
//
// zod 3, not 4: 4 carries a `0n` literal. The `BigInt` schemas and `.emoji()`, whose pattern is built
// with the `u` flag at run time, are left alone.
import { z } from 'zod3';
import { checker } from './checks.mjs';

const User = z.object({
  name: z.string().min(2),
  age: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).default([]),
  role: z.enum(['admin', 'user']),
});

export function run() {
  const { checks, check } = checker();
  const ok = User.safeParse({ name: 'Ada', role: 'admin' });
  check('parse_ok', [ok.success, ok.data], [true, { name: 'Ada', role: 'admin', tags: [] }]);
  const bad = User.safeParse({ name: 'A', age: -1.5, role: 'root' });
  check('parse_issues', bad.error.issues.map(issue => [issue.path.join('.'), issue.code]).sort(),
    [['age', 'invalid_type'], ['age', 'too_small'], ['name', 'too_small'], ['role', 'invalid_enum_value']].sort());
  const Shape = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('circle'), r: z.number() }),
    z.object({ kind: z.literal('square'), side: z.number() }),
  ]);
  check('discriminated', [Shape.parse({ kind: 'square', side: 2 }).side, Shape.safeParse({ kind: 'oval' }).error.issues[0].code],
    [2, 'invalid_union_discriminator']);
  const Trimmed = z.string().transform(value => value.trim()).pipe(z.string().min(1));
  check('transform_pipe', [Trimmed.parse('  x '), Trimmed.safeParse('   ').success], ['x', false]);
  const Even = z.number().refine(value => value % 2 === 0, { message: 'odd' });
  check('refine', [Even.safeParse(4).success, Even.safeParse(3).error.issues[0].message], [true, 'odd']);
  check('coerce', [z.coerce.number().parse('42'), z.coerce.boolean().parse(0)], [42, false]);
  const Tree = z.lazy(() => z.object({ value: z.number(), children: z.array(Tree) }));
  check('recursive', Tree.safeParse({ value: 1, children: [{ value: 2, children: [] }] }).success, true);
  check('record_tuple', [z.record(z.number()).parse({ a: 1 }), z.tuple([z.string(), z.number()]).safeParse(['a', 'b']).success],
    [{ a: 1 }, false]);
  return { checks };
}
