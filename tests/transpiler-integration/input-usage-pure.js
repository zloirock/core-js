// These proposals don't exist natively — pure imports MUST be injected by the plugin
export const filterReject = [1, 2, 3, 4].filterReject(x => x % 2);
export const uniqueBy = [1, 2, 3, 2, 1].uniqueBy();
export const setFrom = Set.from([1, 2, 3]).size;
export const cooked = String.cooked`hello`;
