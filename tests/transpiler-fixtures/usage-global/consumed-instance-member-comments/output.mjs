import "core-js/modules/es.array.at";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
// Nested helpers retain inner trivia before outer trivia, including the call boundary.
export const result = [1] /* receiver */. /* connector */slice /* property */(/* argument */0)
/* outer receiver */. /* outer connector */at /* outer property */(0);
export const folded = [1]['a' /* folded key */ + 't'](0);