# Arboreal.js

A micro-library for traversing and manipulating tree-like data
structures in JavaScript; works with both node.js and the browser.

<img src="http://travis-ci.org/afiore/arboreal.png" />

## Installation

In node.js:

    git clone git://github.com/afiore/arboreal
    npm install

To use it in the browser, just load `lib/arboreal.js` in
a script tag.

## Usage

Arboreal provides a set of methods for parsing, manipulating, and
traversing tree like data structures. A tree can be created from scratch and then extended with child elements.

    var tree = new Arboreal()

    tree
      .appendChild()
      .appendChild()
      .children[0]
         .appendChild()
         .appendChild();

For each child node, Arboreal will automatically assign an id string representing the depth and the index
the position of the node within the tree structure.

    tree.children[0].children[1].id

    // => 0/0/1

Alternatively, Arboreal can also parse an existing object into a tree (though it will need to 
know the name of the 'children' attribute).

    var wikipediaJsCategory = {
      category: 'JavaScript',
      subcategories: [
        {category: 'Ajax (programming)'},
        {category: 'JavaScript engines'},
        {category: 'JavaScript programming languages family',
         subcategories: [{
           category: 'JavaScript dialect engines'
         }]
        },
        {category: 'JavaScript based calendar components'},
        {category: 'JavaScript based HTML editors'}
      ]
    };

    var tree = Arborel.parse(wikipediaJsCategory, 'subcategories');
    
Also several children (or even the whole tree) can be added at the same time (syntax is similar as parse)

    var tree = new Arboreal();
    tree.children[1].appendChildren({category:'C#', subitems:[{category:'WPF'}]}, "subitems" );

### Traversal

An Arboreal object can be traversed either upwards or downwards.

    function iterator (node) {
      var depth = "", i;
      for (i = 1; i <= node.depth; i++) depth += ">>";
      console.info([depth, node.data.category].join(" "));
    }

    tree.traverseDown(iterator);

    // =>   JavaScript
    //      >> Ajax (programming)
    //      >> JavaScript engines
    //      >> JavaScript produgramming languages family
    //      >>>> JavaScript dialect engines
    //      >> JavaScript based calendar components
    //      >> JavaScript based HTML editors


    tree.children[2].traverseUp(iterator);

    //  => >> JavaScript produgramming languages family
    //     >>>> JavaScript dialect engines
    //      JavaScript
    //     >> Ajax (programming)
    //     >> JavaScript engines
    //     >> JavaScript based calendar components
    //     >> JavaScript based HTML editors


Note that in both the `traverseDown` and the `traverseUp` methods, the
value of `this` in the iterator is bound to the value of the
currently traversed `node`. Our iterator function can in fact be
rewritten as:

    function iterator () {
      var depth = "", i;
      for (i = 1; i <= this.depth; i++) depth += ">>";
      console.info([depth, this.data.category].join(" "));
    }

### Search

In order to search for a single node into an arboreal object, one can use the `find`
method.

    tree.find(function (node) {
      return (/calendar/).test(node.data.category)
    }).data.category;

    // =>  JavaScript based calendar components

The find method will also accept a string as an argument. In that case,
it will try to find a node by id.

    tree.find("0/2/0").data.category

    // => JavaScript dialect engines

### Manipulation

While traversing a tree, nodes can be deleted by calling the `remove`
method on the node object bound to the iterator function.

    tree.getLength();

    // => 7

    tree.traverseDown(function (item) {
      var toDelete = 'JavaScript programming languages family';
      if (item.data.category === toDelete) {
        this.remove();
      }
    });

    tree.getLength();

    // 5

## Testing

Arboreal test suite uses [Jasmine](http://pivotal.github.com/jasmine/).
To run it in node.js..

    cd /home/me/code/arboreal && npm test

To run it in the browser, just open the `test/index.html`

## Minfication

A minified version of Arboreal can be generated by running

    node make.js
