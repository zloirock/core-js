// An indirect require whose callee is a NESTED comma sequence. The descent to the callee ran one
// level, so this entry was not recognised at all: the statement stayed in place and none of its
// targets were injected, while the flat one-level twin worked. Both prefix calls must survive the
// statement's removal - the entry is replaced, the effects it discarded are not.
(a(), (b(), require))('core-js/es/array/from');
