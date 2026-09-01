import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// a -next-line written as a JSX comment child covers the children on the line below it and stops
// there: the whitespace text between two children opens on that line and ends on the next, and it is
// text, not a host the directive spans across. the child on the following line stays live, and the
// output leads the whole statement by a directive of its own, since a JSX child cannot open a line
// core-js-disable-next-line
export const el = <div>
    {/* core-js-disable-next-line */}
    {a.at(0)} {b.flat()}
    {c.includes(v)}
  </div>;