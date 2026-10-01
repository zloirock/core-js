// a for-of head keeping a rest beside a static reads the static off the element; the rest is a copy
// of the element's own enumerable keys, so a static read off it stays raw and an `in` probe on it is
// no probe of the constructor - even where the head is relocated and its declarator re-spelled
const on = [1].length > 0;
for (const { from, ...rest } of [Array]) console.log(from([1]), rest.of, 'isArray' in rest);
for (const { groupBy, ...others } of [on ? Map : Map]) console.log(groupBy, others.groupBy);
