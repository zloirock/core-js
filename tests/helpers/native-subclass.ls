Function('return this')!nativeSubclass = try
  Function("'use strict';class O extends Object {};return new O instanceof O;")! and Function \F """
    'use strict';
    class G extends F {};
    return G;
    """