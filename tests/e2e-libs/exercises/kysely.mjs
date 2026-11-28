// kysely, the SQL query builder: queries compiled, executed and streamed, a migration run and a schema
// introspected, all against a fake MySQL driver that records each compiled query and answers from a
// script. Expected values are the input's (rows the driver hands back, migration names) or MySQL's
// own spelling - backtick-quoted identifiers, `?` placeholders; where the text is Kysely's choice -
// keyword case, spacing, clause order - it is its documented output.
//
// Its reason is the SYNTAX axis, by density: Kysely's own source spells forms no library here does.
// Over the module graph the exercise imports - every module of which the provider reads, kept or
// tree-shaken - measured with a parser: 12 async generators and 7 `for await` loops, 12 `sql`
// tagged templates, 5 private accessors - none of which the corpus spells at all - beside 172
// private fields and 57 private methods, where the corpus has one of each. The exercise drives them
// rather than only bundling them; V8 coverage of a native run counts as executed 2 async generators
// and 2 `for await` loops (`stream()` in the select builder and the query executor), 3 tagged
// templates (the MySQL adapter's lock, taken and released, and the introspector's `database()`),
// all 5 private accessors (the migrator's - four change what the checks see;
// `#allowUnorderedMigrations` defaults to `false`, which a getter that returned nothing reads as
// too), 42 private fields and 29 private methods.
//
// The driver's streamQuery returns an array, so Kysely's for-await loop exercises the transpiled
// async-from-sync iterator even where the host has no Symbol. The post-Babel pure providers must
// rewrite the lowered iterator helper so it can find the array iterator in that environment.
//
// MySQL, not postgres: the postgres adapter calls `BigInt` while its module loads, which IE11 does not
// survive. The driver returns `numAffectedRows` as a number, and insert / update / delete are only
// compiled, so none of the `BigInt(0)` fallbacks behind them runs.
import { Kysely, MysqlAdapter, MysqlIntrospector, MysqlQueryCompiler } from 'kysely';
import { Migrator } from 'kysely/migration';
import { checker } from './checks.mjs';

function fakeDialect(respond, log) {
  const connection = {
    executeQuery: compiled => {
      log.push(compiled.sql);
      return Promise.resolve({ rows: respond(compiled.sql), numAffectedRows: 1 });
    },
    // a plain ARRAY of results: kysely's `for await` takes it through the async-from-sync iterator,
    // so nothing here spells a generator or a symbol
    streamQuery: compiled => {
      log.push(compiled.sql);
      const rows = respond(compiled.sql);
      return [{ rows: rows.slice(0, 2) }, { rows: rows.slice(2) }];
    },
  };
  function done() {
    return Promise.resolve();
  }
  return {
    createAdapter: () => new MysqlAdapter(),
    createDriver: () => ({
      init: done, destroy: done, beginTransaction: done, commitTransaction: done, rollbackTransaction: done, releaseConnection: done,
      acquireConnection: () => Promise.resolve(connection),
    }),
    createIntrospector: db => new MysqlIntrospector(db),
    createQueryCompiler: () => new MysqlQueryCompiler(),
  };
}

const PEOPLE = [{ id: 1, first_name: 'Ada' }, { id: 2, first_name: 'Grace' }, { id: 3, first_name: 'Lin' }];

function answer(text) {
  if (text.indexOf('from `person`') !== -1) return PEOPLE;
  return [];
}

export function run() {
  const { checks, check } = checker();
  const log = [];
  const db = new Kysely({ dialect: fakeDialect(answer, log) });

  // --- compilation: identifiers quoted, values bound as numbered parameters ---
  const select = db.selectFrom('person')
    .innerJoin('pet', 'pet.owner_id', 'person.id')
    .select(['person.first_name', 'pet.name as pet_name'])
    .where('person.age', '>', 18)
    .orderBy('person.first_name')
    .limit(10)
    .compile();
  check('compile_select', [select.sql, select.parameters], [
    'select `person`.`first_name`, `pet`.`name` as `pet_name` from `person` inner join `pet` on `pet`.`owner_id` = `person`.`id`'
      + ' where `person`.`age` > ? order by `person`.`first_name` limit ?',
    [18, 10],
  ]);
  const insert = db.insertInto('person').values({ first_name: 'Ada', age: 36 }).compile();
  check('compile_insert', [insert.sql, insert.parameters], ['insert into `person` (`first_name`, `age`) values (?, ?)', ['Ada', 36]]);
  const update = db.updateTable('person').set({ age: 37 }).where('id', '=', 1).compile();
  check('compile_update', [update.sql, update.parameters], ['update `person` set `age` = ? where `id` = ?', [37, 1]]);

  // --- execution through the driver, a stream of the same rows, the migrator and the introspector ---
  const streamed = [];
  function drain(iterator) {
    // eslint-disable-next-line promise/prefer-await-to-then -- `.then` keeps this module regenerator-free
    return iterator.next().then(step => {
      if (step.done) return streamed;
      streamed.push(step.value.first_name);
      return drain(iterator);
    });
  }

  // a schema of its own for the bookkeeping tables, so the migrator's `#migrationTableSchema` reads
  // something other than the undefined its default would be
  const migrator = new Migrator({
    db,
    migrationTableSchema: 'meta',
    provider: {
      getMigrations: () => Promise.resolve({
        '001_person': { up: inner => inner.schema.createTable('person').addColumn('id', 'serial', col => col.primaryKey()).execute() },
        '002_pet': { up: inner => inner.schema.createTable('pet').addColumn('owner_id', 'integer', col => col.references('person.id')).execute() },
      }),
    },
  });

  // `.then` rather than `async`: an async exercise lowers to a regenerator of its own, and the async
  // machinery under test is Kysely's
  /* eslint-disable promise/prefer-await-to-then -- see above */
  return db.selectFrom('person').selectAll().execute()
    .then(rows => {
      check('execute_select', rows.map(row => row.first_name), ['Ada', 'Grace', 'Lin']);
      return drain(db.selectFrom('person').selectAll().stream());
    })
    .then(names => {
      check('stream_select', names, ['Ada', 'Grace', 'Lin']);
      log.length = 0;
      return migrator.migrateToLatest();
    })
    .then(outcome => {
      check('migrate_results', [outcome.error?.message ?? outcome.error, outcome.results?.map(result => [result.migrationName, result.direction, result.status])],
        [undefined, [['001_person', 'Up', 'Success'], ['002_pet', 'Up', 'Success']]]);
      // the MySQL adapter takes and releases its named lock through its own `sql` tagged templates,
      // around the DDL the migrations built. The templates' interpolations are what is checked: one
      // quoted lock id in both queries and a number of seconds in the first - a lowering that lost
      // its values would send `get_lock()` and still match a bare prefix
      function has(needle) {
        return log.some(text => text.indexOf(needle) !== -1);
      }
      function sent(prefix) {
        for (let i = 0; i < log.length; i++) if (log[i].indexOf(prefix) === 0) return log[i];
        return '';
      }
      const lock = sent('select get_lock(');
      const release = sent('select release_lock(');
      check('migrate_lock', [/^select get_lock\('[^']+', \d+\)$/.test(lock), /^select release_lock\('[^']+'\)$/.test(release),
        release.split("'", 2)[1] === lock.split("'", 2)[1],
        log.indexOf(lock) < log.indexOf(sent('create table `person`')),
        log.indexOf(sent('create table `person`')) < log.indexOf(sent('create table `pet`')),
        log.indexOf(sent('create table `pet`')) < log.indexOf(release),
        has('`meta`.`kysely_migration`')], [true, true, true, true, true, true, true]);
      return db.introspection.getTables();
    })
    .then(tables => {
      // the introspector's own `sql` tag scopes the catalog query to `database()`
      check('introspect', [tables.length, log[log.length - 1].indexOf('database()') !== -1], [0, true]);
      return { checks };
    });
  /* eslint-enable promise/prefer-await-to-then -- see above */
}
