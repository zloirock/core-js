// Kept readers share one captured getter; rest retains its own native boundary.
let method, kept, rest;
({ y: { at: method, length: kept } } = { y: holder.rows });
({ y: { at: method }, kept } = { y: holder.rows, kept: 1 });
({ y: { at: method, ...rest } } = { y: holder.rows });
