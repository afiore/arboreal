# Arboreal.js [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/vasiliyaltunin/arboreal.js/master/MIT-LICENSE.txt)

A micro-library for traversing and manipulating tree-like data
structures in JavaScript, works with both node.js and the browser.

(Forked from [Nenad V. Nikolić](https://github.com/shonzilla/arboreal), originally by [Andrea Fiore](https://github.com/afiore/arboreal))

## Installation

Install via npm:

```bash
% npm install arboreal.js
```

## Usage

Add script to you webpage

```html
<script src="../lib/arboreal.min.js" type="text/javascript"></script>
```

Arboreal.js provides a set of methods for parsing, manipulating, and
traversing tree like data structures. A tree can be created from scratch and then extended with child elements.

    var tree = new Arboreal()

    tree
      .appendChild()
      .appendChild()
      .children[0]
         .appendChild()
         .appendChild();

For each child node, Arboreal.js will automatically assign an id string representing the depth and the index
the position of the node within the tree structure.

    tree.children[0].children[1].id

    // => 0/0/1

Check our [wiki](https://github.com/vasiliyaltunin/arboreal.js/wiki) for more usage examples. 

Also check this [demo](https://vasiliyaltunin.github.io/arboreal.js/examples).

## Contributing

Here's a quick guide:

1. Fork the repo 

2. `npm install`

3. `grunt`

4. Make you changes and add test for you functionality. Look into `/test` folder.

5. Check that all test passed by running `grunt`

6. Push to your fork and submit a pull request.


## Minfication

A minified version generated into `/lib` when you run `grunt`

## Licence

Released under MIT License - https://opensource.org/licenses/MIT
