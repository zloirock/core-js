// A headless TanStack Table v9 project - the data grid behind admin screens, with no DOM by design:
// nested column groups, a deep accessor, sorting on one and several columns, a text filter,
// pagination, grouping with aggregation and column sizing, verified by what the table hands back.
// Every expected order and total below is DEFINED by the data set, not observed from a run.
//
// Its reason is the SURFACE axis: it reaches polyfills from its own frames that no library before it
// in the corpus did. Measured on the babel-plugin cells against the union of the six reference
// baselines before it: `usage-global` adds `Object.is` and `queueMicrotask`, and `usage-pure` adds
// six entries - `flatMap`, string `includes`, `Reflect.ownKeys`, `Number.MAX_SAFE_INTEGER`,
// `Object.is` and `queueMicrotask`. The checks below are laid out so that each of them EXECUTES
// rather than only being injected: `flatMap` flattens the column groups, `includes` is how a
// dotted accessor key is recognised, `MAX_SAFE_INTEGER` is the upper bound a column size is clamped
// to, and `queueMicrotask` is how the store binding defers the page reset a filter change causes.
// `Object.is` and `Reflect.ownKeys` need no check of their own: every `set*` call below goes through
// the table's structural state comparison, which starts with the one and walks keys with the other.
//
// `queueMicrotask` is why `run()` ends asynchronously. The reset is scheduled, not applied, so the
// check reads the page index twice - synchronously, where it must still be the old page, and after a
// MACROtask, which every microtask implementation core-js may pick on this floor drains ahead of.
// The tail is a plain `.then` on a `setTimeout`, never `async`/`await`, so no regenerator from this
// module stands between the library and the polyfill.
//
// `./process-env.mjs` is imported for table-core, which reads `process.env.NODE_ENV` as soon as a
// table is constructed; the checks answer the same under either value. Neither sorting nor filtering
// uses a locale-aware comparison on these values, and no path reads the clock or `Math.random()`, so
// the file answers the same on every engine and every run.
import './process-env.mjs';
import {
  aggregationFn_sum as aggregationFnSum, columnFilteringFeature, columnGroupingFeature, columnSizingFeature,
  constructTable, createColumnHelper, createFilteredRowModel, createGroupedRowModel, createPaginatedRowModel,
  createSortedRowModel, filterFn_includesString as filterFnIncludesString, rowAggregationFeature,
  rowPaginationFeature, rowSortingFeature, sortFn_basic as sortFnBasic, sortFn_text as sortFnText, tableFeatures,
} from '@tanstack/table-core';
import { storeReactivityBindings } from '@tanstack/table-core/store-reactivity-bindings';
import { checker } from './checks.mjs';

const STAFF = [
  { id: '1', name: 'Ada', meta: { team: 'eng' }, salary: 120 },
  { id: '2', name: 'Grace', meta: { team: 'eng' }, salary: 150 },
  { id: '3', name: 'Alan', meta: { team: 'ops' }, salary: 90 },
  { id: '4', name: 'Barbara', meta: { team: 'ops' }, salary: 110 },
  { id: '5', name: 'Dennis', meta: { team: 'eng' }, salary: 130 },
  { id: '6', name: 'Frances', meta: { team: 'sales' }, salary: 70 },
  { id: '7', name: 'Ken', meta: { team: 'sales' }, salary: 100 },
];

const helper = createColumnHelper();
const COLUMNS = helper.columns([
  helper.group({ id: 'person', header: 'Person', columns: helper.columns([
    helper.accessor('name', { header: 'Name', sortFn: 'text', filterFn: 'includesString' }),
    // a DOTTED key: the table recognises it with `String#includes` and reads the nested value
    helper.accessor('meta.team', { id: 'team', header: 'Team', sortFn: 'text' }),
  ]) }),
  helper.accessor('salary', { header: 'Salary', sortFn: 'basic', aggregationFn: 'sum', size: 10, minSize: 40 }),
]);

function table(initialState) {
  const features = tableFeatures({
    coreReactivityFeature: storeReactivityBindings(),
    rowSortingFeature,
    sortedRowModel: createSortedRowModel(),
    sortFns: { text: sortFnText, basic: sortFnBasic },
    columnFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    filterFns: { includesString: filterFnIncludesString },
    rowPaginationFeature,
    paginatedRowModel: createPaginatedRowModel(),
    columnGroupingFeature,
    rowAggregationFeature,
    groupedRowModel: createGroupedRowModel(),
    aggregationFns: { sum: aggregationFnSum },
    columnSizingFeature,
  });
  return constructTable({ features, columns: COLUMNS, data: STAFF, getRowId: row => row.id, initialState });
}
// the whole data set on one page, unless a check says otherwise
const ALL = { pageIndex: 0, pageSize: 100 };

function names(instance) {
  return instance.getRowModel().rows.map(row => row.getValue('name')).join(',');
}
function ids(columns) {
  return columns.map(column => column.id);
}

export function run() {
  const { checks, check } = checker();

  // --- columns: the group is flattened by the table itself, which is where `flatMap` runs ---
  const grid = table({ pagination: ALL });
  check('columns_leaf', ids(grid.getAllLeafColumns()), ['name', 'team', 'salary']);
  check('columns_flat', ids(grid.getAllFlatColumns()), ['person', 'name', 'team', 'salary']);
  // two header rows: the group over its two leaves, and `salary` standing in both - a placeholder
  // above, in parentheses, and itself below - which is the table's own layout of a mixed depth
  const headerRows = grid.getHeaderGroups().map(group => group.headers
    .map(header => header.isPlaceholder ? `(${ header.column.id })` : header.column.id));
  check('header_groups', headerRows, [['person', '(salary)'], ['name', 'team', 'salary']]);
  const { rows } = grid.getRowModel();
  check('deep_accessor', rows.length ? rows[0].getValue('team') : undefined, 'eng');

  // --- sorting: the orders are the data's, so an identity comparator leaves the input order. Every
  // column NAMES its sort function: left to itself the table picks `text` or its own module-local
  // `sortFn_basic`, and a function registered here but never named is configuration nothing reads ---
  grid.setSorting([{ id: 'name', desc: false }]);
  check('sort_name', names(grid), 'Ada,Alan,Barbara,Dennis,Frances,Grace,Ken');
  grid.setSorting([{ id: 'salary', desc: true }]);
  check('sort_salary_desc', names(grid), 'Grace,Dennis,Ada,Barbara,Ken,Alan,Frances');
  // team first, then salary within a team: eng 150/130/120, ops 110/90, sales 100/70
  grid.setSorting([{ id: 'team', desc: false }, { id: 'salary', desc: true }]);
  check('sort_multi', names(grid), 'Grace,Dennis,Ada,Barbara,Alan,Ken,Frances');
  grid.setSorting([]);

  // --- filtering: `includesString` lowercases both sides, so "AN" finds the two names holding "an" ---
  grid.setColumnFilters([{ id: 'name', value: 'AN' }]);
  check('filter_includes', names(grid), 'Alan,Frances');
  grid.setColumnFilters([]);

  // --- pagination: seven rows at three a page ---
  const paged = table({ pagination: { pageIndex: 0, pageSize: 3 } });
  const firstPage = names(paged);
  paged.nextPage();
  check('pagination', [paged.getPageCount(), firstPage, names(paged), paged.getCanNextPage()],
    [3, 'Ada,Grace,Alan', 'Barbara,Dennis,Frances', true]);

  // --- grouping with aggregation: one row per team, carrying the sum of its members ---
  const grouped = table({ grouping: ['team'], pagination: ALL });
  const teams = grouped.getRowModel().rows
    .map(row => `${ row.getValue('team') }:${ row.getValue('salary') }:${ row.subRows.length }`);
  check('group_aggregate', teams, ['eng:400:3', 'ops:200:2', 'sales:170:2']);

  // --- sizing: a size under the column's own minimum, raised to it by the library's clamp, whose upper
  // bound is `MAX_SAFE_INTEGER` - without that constant the clamp answers NaN ---
  const salary = grid.getColumn('salary');
  check('column_size', salary && salary.getSize(), 40);

  // --- the deferred reset: page 2, then a filter change. A row model never resets the page on its
  // first computation, hence the read before the change; the read after it is what schedules
  // `autoResetPageIndex`, so the index taken right then is one a reset applied on the spot would
  // already have moved ---
  const resetting = table({ pagination: { pageIndex: 1, pageSize: 3 } });
  names(resetting);
  resetting.setColumnFilters([{ id: 'name', value: 'a' }]);
  names(resetting);
  const pageRightAfter = resetting.store.state.pagination.pageIndex;
  // eslint-disable-next-line promise/prefer-await-to-then -- .then not await: keeps this module regenerator-free (see header)
  return new Promise(resolve => { setTimeout(resolve, 0); }).then(() => {
    check('deferred_page_reset', [pageRightAfter, resetting.store.state.pagination.pageIndex], [1, 0]);
    return { checks };
  });
}
