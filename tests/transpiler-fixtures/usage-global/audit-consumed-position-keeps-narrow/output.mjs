import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// global flavor: a consuming position leaves the field's family known, so only that family's module
// is injected; a tagged template hands the raw value to the tag and every candidate family has to be
// covered instead. distinct method per row so the two verdicts stay attributable
const statementPosition = {
  rows: [1, 2],
  read() {
    return this.rows.includes(1);
  }
};
statementPosition;
const taggedSubstitution = {
  cells: [1, 2],
  read() {
    return this.cells.at(0);
  }
};
tag`${taggedSubstitution}`;