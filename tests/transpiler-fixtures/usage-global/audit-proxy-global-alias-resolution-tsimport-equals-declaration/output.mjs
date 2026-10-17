// NEGATIVE: an inner shadow swallows the import - the local object's method stays native
// (es.object.from-entries must not appear)
import gS = require("@core-js/pure/actual/global-this");