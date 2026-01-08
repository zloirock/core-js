import 'core-js/full';

const rdedent1: string = String.dedent`foo\nbar`;
const rdedent2: string = String.dedent`line1
  line2
  line3`;

const tpl = Object.assign(['foo', 'bar'], { raw: ['foo', 'bar'] });
String.dedent(tpl, 1, 2);

String.dedent({ raw: ["a\n  b\n", "\n  c\n"] }, 1, 2);

String.dedent(() => 'template string');

// @ts-expect-error
'string\ndedent'.dedent();

// @ts-expect-error
String.dedent();
