// graphql 16: a schema built from SDL, queries executed against it, validation, the document round
// trip and introspection. Every expected value is DEFINED by the input or by the GraphQL
// specification - execution semantics, the validation rules, error locations counted from 1, the
// introspection types - or, where the specification leaves the choice to the implementation, by
// graphql's own: the tag a class reports is its name, and a conflict found in subfields points at
// every field involved. None is observed from a run. 17 is out of reach: its scalars carry a `0n`
// literal, which no down-compile lowers.
//
// Its reason is the SURFACE axis, and beside it a shape no library here has, which brings no entry
// of its own - `symbol/to-string-tag` is in the corpus already - but a path that stays alive only
// while both sides of a lookup use one symbol. Nineteen of the classes its reference cells keep define
// `get [Symbol.toStringTag]()` - elsewhere in the corpus a well-known symbol is a computed key only
// for iteration and disposal - and graphql READS the tag back: outside production, which is what a
// page without `process` runs, every `isObjectType`-style check that fails `instanceof` compares
// `constructor.prototype[Symbol.toStringTag]` with
// `Symbol.toStringTag in value ? value[Symbol.toStringTag] : ...`, and throws "from another module
// or realm" when the two agree. So the key a class is defined under and the key the check asks for
// must be one key in both flavors - in the pure one that is core-js's own symbol on both sides.
// With every getter answering `undefined` the exercise dies on its first type check, which is how
// that path is known to be driven. The surface comes from elsewhere in the library: measured on the
// babel-plugin cells against the union of the eleven reference baselines before it, `usage-global`
// gains `String#matchAll` and `Promise.allSettled`, `usage-pure` those two and the array `flat` and
// `entries`. `matchAll` is `getLocation`, run for every error location here; `flat` joins the
// fields of a conflict found in subfields, which `validate_conflict` provokes; `allSettled` and the
// array `entries` sit on the asynchronous execution path, which nothing here takes.
import {
  GraphQLSchema, buildClientSchema, buildSchema, getIntrospectionQuery, graphqlSync, isObjectType, isScalarType,
  parse, print, printSchema, validate, visit,
} from 'graphql';
import { checker } from './checks.mjs';

const SDL = `
  interface Node { id: ID! }
  type Book implements Node { id: ID! title: String! pages: Int tags: [String!]! }
  type Author implements Node { id: ID! name: String! books(min: Int = 0): [Book!]! }
  union Item = Book | Author
  enum Order { ASC DESC }
  input Filter { prefix: String, order: Order = ASC }
  type Query { author(id: ID!): Author  items(filter: Filter): [Item!]!  sum(a: Int!, b: Int!): Int! }
`;

const BOOKS = [
  { id: 'b1', title: 'Alpha', pages: 120, tags: ['x'] },
  { id: 'b2', title: 'Beta', pages: 300, tags: [] },
];

const AUTHOR = {
  id: 'a1',
  name: 'Ann',
  books: ({ min }) => BOOKS.filter(book => book.pages >= min),
};

function typeOf(value) {
  return 'title' in value ? 'Book' : 'Author';
}

// the resolvers are the exercise's frames, so they stay ES5: what they reach would enter the
// baselines as the library's
const ROOT = {
  author: ({ id }) => id === AUTHOR.id ? AUTHOR : null,
  items: ({ filter }) => {
    const prefix = filter && filter.prefix;
    const all = BOOKS.concat(AUTHOR).filter(item => !prefix || (item.title || item.name).indexOf(prefix) === 0);
    return filter && filter.order === 'DESC' ? all.reverse() : all;
  },
  sum: ({ a, b }) => a + b,
};

// where the parse failed - the position of the offending token, which the input alone decides
function syntaxErrorAt(source) {
  try {
    parse(source);
    return null;
  } catch (error) {
    return error.locations[0];
  }
}

export function run() {
  const { checks, check } = checker();
  const schema = buildSchema(SDL);
  schema.getType('Item').resolveType = typeOf;
  schema.getType('Node').resolveType = typeOf;
  function exec(source, variableValues) {
    // eslint-disable-next-line node/no-sync -- graphql's own synchronous entry point, not a node API
    return graphqlSync({ schema, source, rootValue: ROOT, variableValues });
  }

  // --- the tag getters, read directly and through the development `instanceOf` a browser runs ---
  check('tags', [schema[Symbol.toStringTag], schema.getType('Book')[Symbol.toStringTag]], ['GraphQLSchema', 'GraphQLObjectType']);
  check('type_predicates', [isObjectType(schema.getType('Book')), isObjectType(schema.getType('Order')), isScalarType(schema.getType('Int'))], [true, false, true]);

  // --- execution: arguments with defaults, aliases, fragments on an interface and a union ---
  const books = exec('{ author(id: "a1") { name all: books { title } long: books(min: 200) { title } } }');
  check('execute_args', books.data, { author: { name: 'Ann', all: [{ title: 'Alpha' }, { title: 'Beta' }], long: [{ title: 'Beta' }] } });
  const union = exec('query($f: Filter) { items(filter: $f) { __typename ... on Book { pages } ... on Node { id } } }', { f: { prefix: 'B', order: 'DESC' } });
  check('execute_union', union.data, { items: [{ __typename: 'Book', pages: 300, id: 'b2' }] });
  check('execute_null', exec('{ author(id: "zz") { name } }').data, { author: null });
  check('execute_sum', exec('{ sum(a: 20, b: 22) }').data, { sum: 42 });

  // --- coercion is spec-defined: Int is a signed 32-bit integer, so 2^31 is a variable error ---
  const overflow = exec('query($a: Int!) { sum(a: $a, b: 1) }', { a: 2147483648 });
  check('coerce_int', [overflow.data, overflow.errors.length], [undefined, 1]);

  // --- validation: an unknown field is rejected at its location, line and column counted from 1;
  // two `books` answering to one response name conflict through their subfields, and the one error
  // points at all four fields involved - both `books` and both `t` ---
  const unknown = validate(schema, parse('{\n  author(id: "a1") {\n    nope\n  }\n}'));
  check('validate_unknown', [unknown.length, unknown[0].locations], [1, [{ line: 3, column: 5 }]]);
  const conflict = validate(schema, parse('{ author(id: "a1") {\n  books { t: title }\n  books { t: id }\n} }'));
  check('validate_conflict', [conflict.length, conflict[0].locations.map(location => location.line).sort()], [1, [2, 2, 3, 3]]);
  check('syntax_error', syntaxErrorAt('{ author( }'), { line: 1, column: 11 });

  // --- the document round trip: printing what was parsed parses back to the same document, and a
  // visitor that renames a field reaches every occurrence of it ---
  const document = parse('query Q($x: Int = 3) { a: sum(a: $x, b: 1) ...F } fragment F on Query { sum(a: 1, b: 1) }');
  const printed = print(document);
  check('print_stable', [print(parse(printed)) === printed, printed.indexOf('fragment F on Query') !== -1], [true, true]);
  const renamed = print(visit(document, {
    Name: node => node.value === 'sum' ? { kind: node.kind, value: 'total', loc: node.loc } : undefined,
  }));
  check('visit_rename', [renamed.indexOf('total(') !== -1, renamed.indexOf('sum(') === -1], [true, true]);

  // --- introspection: the schema rebuilt from its own introspection prints identically, and holds
  // the scalars the SDL references and the introspection types the specification requires ---
  const introspection = exec(getIntrospectionQuery()).data;
  const rebuilt = buildClientSchema(introspection);
  check('introspection', [rebuilt instanceof GraphQLSchema, printSchema(rebuilt) === printSchema(schema)], [true, true]);
  const { __schema: meta } = introspection;
  const names = meta.types.map(type => type.name);
  check('spec_types', ['Int', 'String', 'Boolean', 'ID', '__Schema', '__Type'].map(name => names.indexOf(name) !== -1), [true, true, true, true, true, true]);

  return { checks };
}
