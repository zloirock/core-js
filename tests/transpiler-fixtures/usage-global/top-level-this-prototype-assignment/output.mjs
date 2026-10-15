import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.find-index";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.code-point-at";
import "core-js/modules/es.string.ends-with";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.starts-with";
import "core-js/modules/web.dom-collections.iterator";
// Top-level this names the realm. Nested prototype leaves require their instance modules
// beside a sibling, a prefix or a leaf default, and after loop-head relocation.
// A prefix runs once, either inside the residual RHS or immediately before it.
let at, stringIncludes, flat, sibling;
({
  Array: {
    prototype: {
      at
    }
  },
  sibling
} = this);
({
  String: {
    prototype: {
      includes: stringIncludes
    }
  },
  sibling
} = this);
({
  Array: {
    prototype: {
      flat = fallback()
    }
  }
} = this);
const {
  Array: {
    prototype: {
      findIndex
    }
  }
} = (touch(), this);
const {
  String: {
    prototype: {
      codePointAt
    }
  }
} = (touch(), this);
let map, endsWith;
({
  Array: {
    prototype: {
      map
    }
  },
  sibling
} = (touch(), this));
({
  String: {
    prototype: {
      endsWith = /* method default */fallback()
    }
  },
  sibling
} = (/* receiver prefix */touch(), this));
for (const {
  Array: {
    prototype: {
      findLast
    }
  }
} of [this]) consume(findLast);
for (const {
  String: {
    prototype: {
      startsWith
    }
  }
} of [this]) consume(startsWith);
for (const realm of [this]) {
  const {
    Array: {
      prototype: {
        filter
      }
    }
  } = realm;
  consume(filter);
}
for (const realm of [this]) {
  const {
    String: {
      prototype: {
        repeat
      }
    }
  } = realm;
  consume(repeat);
}
export { at, stringIncludes, flat, sibling, map, endsWith, findIndex, codePointAt };