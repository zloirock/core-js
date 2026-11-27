const holder = { rows: ['word'] };
const rows = holder.rows;
rows.unshift([7]);
export const first = holder.rows[0].at(0);
