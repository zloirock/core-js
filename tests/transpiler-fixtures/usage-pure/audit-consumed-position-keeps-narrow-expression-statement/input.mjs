// A value sitting in a position that CONSUMES it opens no write channel: a bare statement and an untagged template's coercion
// evaluate it and leave nothing able to reach it, so the narrow holds.
const statementPosition = {
  rows: [1, 2],
  read() {
    return this.rows.at(0);
  }
};
statementPosition;
