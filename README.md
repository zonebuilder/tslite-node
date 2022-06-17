TSLite - TypeScript Lite
========================

Would you like to convert your JavaScript to TypeScript automatically? While keeping [TSC's](https://www.typescriptlang.org/docs/handbook/compiler-options.html) recommended settings and getting a fully annotated output?

All you need is TSLite and a naming convention …

Naming convention
-----------------

This convention is called **the prefix notation** and is similar to the lengthily used [Hungarian notation](https://en.wikipedia.org/wiki/Hungarian_notation), but is scoped at project level, or even at file level, if necessary. We encourage you to use any short lowercase English letters prefix followed by your camel-case descriptive identifier name. You can use this naming also with TS files, especially if an extension equivalent to TSLite is available for TSC.

The rules for applying the prefix notation are:

*   to locally created variables using const, let, or var keywords
*   to parameter specification of locally created (arrow) functions i.e. parameter list, spread syntax etc. including of anonymous functions

The exceptions where the prefix notation does not apply are:

*   to variables created through importing mechanisms like ES6 modules or CommonJS
*   to top-level (arrow) function names i.e. direct children of the module/file
*   to any established naming convention like class, constructor, or component naming
*   to structure member names e.g. of class, object, map etc. - use interfaces in type definition file alongside with the generated TS code
*   to special identifier names like single letter counters, catch exceptions, event parameters, or any other case when the developer considers appropriate (such as vars included in exports) - TSLite has the ability to also annotate based on the identifier name

In TSLite, a prefix is a left-side sequence of lowercase letters of a string, followed by a non-lowercase character, and optionally preceded by '\_' and/or '$'.

Goals
-----

The first objective is to make it easy for you to integrate an existing JS codebase into a TS project. When coupling the generated code with TS definition files, you can get zero errors and warnings in TSC.

The second objective is to offer you a base to start augmenting your JavaScript code into TypeScript. Use the default permissive types in the beginning, and then refine them as you go.

The third objective is to make the ES6/ES5 code more readable, and use the prefix notation to spot certain logical errors that even the conversion to TS will miss. E.g. the use of a subtype as a parameter instead of the parent type is valid in TypeScript but may not be what the developer intended.

Workflow
--------

Node 10.x or later is recommended for the current version of TSC and for `npx` command line tool.

Alternatively, you may install TSLitee globally by using `npm install -g tslite-node`, and omit `npx` from the respective commands.

1.  Go to the project root and install TSLite as a development dependency:
    
        npm install --save-dev tslite-node
        
    
2.  Create a default _tslite.json_ configuration file by running:
    
        npx tslite --init
        
    
3.  inspect or edit the generated JDON file by referencing the configuration entries with the `npx tslite -h` command.
    
4.  Put your JavaScript source code into the JS input directory (defaults to 'src-js'). Check if the code is valid, by running, testing, or linting it. A linter is strongly recommended.
    
5.  Create an entry within "scripts" in _package.json_ with the content "convert": "tslite". Then, run it:
    
        Npm run convert
        
    
6.  You will get an output TS directory (defaults to 'src-ts') with the converted JS. Inspect or edit the generated TypeScript files, and associate them with type definition files as needed.
    
7.  At this point, many projects will have a pre-existing TypeScript setup created e.g. by a framework templating tool. If so, you may include the convert script in the dev or build (pipeline) scripts.
    
    This step is for projects where TypeScript is not yet installed. Install and initialize TSC:
    
        npm install --save-dev typescript
        npx tsc --init
        
    
8.  Edit the generated _tsconfig.json_ and set "outDir" to "dist". Then, you can create the following "scripts" pipeline in _package.json_:
    
        "scripts": {
          "build": "npm run lint && npm run convert && npm run compile",
          "lint": "eslint src-js",
          "convert": "tslite",
          "compile": "tsc -t es6",
          …
        }
        
    
    Before executing `npm run build`, please make sure to have installed certain dependencies, like:
    
        npm install --save-dev eslint
        npm install --save-dev @types/node
        npm install --save-dev @types/express
        …
        
    

Congrats! You now have the means to automatically convert your valid JavaScript into annotated TypeScript!

Reference
---------

The following info is extracted by running TSLite with the '-h' argument:

    Usage:
    tslite [<input> [<output>]] [-c <config>] [-r <root>] [--init] [-h|--help]
    Options:
      <input>                       Input file or directory to convert from JS to TS
      <output>                      Optional output file or directory path
      -c <config>                   JSON file to load configuration from - defaults to "tslite.json"
      -r <root>                     JavaScript object (dotted) path to configuration inside JSON - defaults to ''
                                    Example: -r "plugins.tslite"
      --init                        Writes a "tslite.json" file with the default settings
      -h
      --help                        Displays this information
    
    Entries available in the JSON configuration:
      "input"                       String or array of strings that are input file or directory paths
      "output"                      String or array of strings that are output file or directory paths
      "matcher"                     One pair array or an array of arrays of pairs with the first pair member
                                    a string with wildcards or the string value of a RegExp and the second pair member
                                    the output wildcard or replacement string. These strings match path endings.
                                    E.g. ["/\\.js(x)?/i", ".ts$1"] or [["*.jsx", "*.tsx"], ["lib/*.js", "lib/*.ts"]]
      "prefixes"                    An object with keys that are prefixes and values that are TypeScript type declarations.
                                    A prefix is a sequence of lowercase English letters which starts an identifier name
                                    omitting leftmost '_' or '$'. It is an exact match and may include regex special chars.
                                    If a prefix is preceded by '$', it matches the whole identifier name.
                                    E.g. {"s": "string", "a": "any[]", "$[i-k]": "number"}
    
    The following directives are recognized in any input file as block comments:
      /* tslite-add: <content> */
                                    Inserts the (multiline) <content> in place in the output file
                                    E.g. /* tslite-add: type Nullable = string | number | null */
      /* tslite-remove: begin|end */
                                    Removes the source code between begin and end block comments from the output
                                    E.g. /* tslite-remove: begin */ require('es6-poly'); /* tslite-remove: end */
      /* tslite-prefixes: ... */
                                    A list of file specific prefixes in the form <key> = <value> separated by
                                    semicolons and/or line breaks. They are applied over the project-wise prefixes
                                    loaded e.g. from the JSON configuration.
                                    E.g. /* tslite-prefixes: req = Express.request; res = Express.response; fn = Function */
    The ':' after a directive is optional. All directive blocks are removed from the output file.
    

Contribute!
-----------

Please write an extension for TSC that hints the types based on the identifier prefix (perhaps at AST build phase), and works in conjunction with a prefix configuration stored maybe as an entry of _tsconfig.json_, which should work the same as TSLite both on JS and on TS files.

By having the ability of type hinting based on the prefix notation, you can reach a common denominator where a fully structural checked TS file without annotation can be renamed and work as JS!

Resources
---------

[Search articles](https://www.google.com/search?hl=en&num=50&start=0&safe=0&filter=0&nfpr=1&q=The+Zonebuilder+web+development+programming+IT+society+philosophy+politics)

[Downloads](https://sourceforge.net/u/zonebuilder/profile/#:~:text=Projects)

