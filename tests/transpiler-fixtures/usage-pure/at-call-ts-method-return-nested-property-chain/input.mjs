type DB = { query(): { rows: { name: string }[] } };
declare const db: DB;
db.query().rows.at(0).name.at(-1);
