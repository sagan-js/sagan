module.exports = {
    extends: 'react-app',
  
    rules: {
        'jsx-a11y/href-no-hash': 'off',
        "no-console": 0,
        "no-new-object": 1, // disallow use of the Object constructor - forces object literal notation instead
        "quote-props": [2, "as-needed", { "keywords": true, unnecessary: false }], // require quotes around object literal property names
        "no-array-constructor": 1, // disallow use of the Array constructor - forces literal notation instead
        "quotes": [1, "single", "avoid-escape"], // require single quotes for string literals, unless a string literal contains single quotes, in which case double quotes will be acceptable.
        "no-inner-declarations": [1, "both"], // disallows function definition outside first level or body of a function
        "no-shadow-restricted-names": 1, // disallow overwrite of restricted names / reserved kws
        "one-var": 0, // allow var definitions anywhere
        "vars-on-top": 0, // allow var definitions anywhere - readability and security have priority over emulating interpreter hoisting
        "eqeqeq": 1, // require use of explicit equality comparators - "===", "!=="
        "no-use-before-define": 0, //Allows the alphabetical and logic declaration of functions and methods
        "no-unused-vars": [1, { "vars": "all", "args": "after-used" }],
        "curly": [1], // require curly braces around all control blocks, regardless of length
        "no-mixed-spaces-and-tabs": 1, // disallow mix of spaces and tabs in line indentation
        "space-before-blocks": [1, "always"], // requires space before block curly braces
        "no-multi-spaces": [2, { exceptions: { "ImportDeclaration": true, "Property": true } }],
        "key-spacing": [1, { "beforeColon": false, "afterColon": true, "mode": "minimum"  }],
        "space-infix-ops": 1, // require spaces around operators
        "keyword-spacing": [1, {"before": true, "after": true, "overrides": {}}], // enforce consistent spacing before and after keywords
        "no-trailing-spaces": 1, // disallow trailing whitespace at the end of lines
        "comma-style": [1, "last"], // disallow 'comma first' notation
        "comma-dangle": [1, "never"], // require or disallow trailing commas
        "semi": [1, "never"], // force semicolons at line ending
        "camelcase": 1, // require camelCase for var and property names, disallowing underscore notation
        "new-cap": 1, // require capital letter for new constructors
        "consistent-this": [1, "that"], // force 'that' for context reference - not '_this', 'self', etc.
        "func-names": 0, // require "double function naming" convention for clearer stack traces
    },
  
    overrides: [
    //   {
    //     files: 'test/**/*.js',
    //     env: {
    //       jest: true,
    //     },
    //   },
    ],
  }