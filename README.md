# Arboreal.js

A micro-library for traversing and manipulating tree-like data
structures in JavaScript; works with both node.js and the browser.

## Installation

In node.js:

    git clone git://github.com/afiore/arboreal
    npm install

To use it in the browser, just load `lib/arboreal.js` in
a script tag.

## Usage

Arboreal provides a set of methods for parsing, manipulating, and
traversing tree like data structures in JavaScript. A tree can be created from scratch and than extended with child elements.

    var tree = new Arboreal()

    tree
      .appendChild()
      .appendChild()
      .children[0]
         .appendChild()
         .appendChild()


Alternatively, arboreal can also parse an existing object into a tree (it needs to know the name of the 'children' attribute though).

    var data = {
      category: 'JavaScript',
      subcategories: [
        {category: 'Ajax (programming)'},
        {category: 'JavaScript engines'},
        {category: 'JavaScript produgramming languages family',
         subcategories: [{
           category: 'JavaScript dialect engines'
         }]
        },
        {category: 'JavaScript based calendar components'},
        {category: 'JavaScript based HTML editors'}
      ]
    };

    var tree = Arborel.parse(data, 'subcategories');

### Traversal

The parsed three can now be traversed both upwards and downwards.

    tree.traverseDown(function (node) {
      console.info([node.depth, node.data.category].join(")"));
    });

    //  => 
    //
    //
    //

    tree.traverseUp(function (node) {
      console.info([node.depth, node.data.category].join(")"));
    });

    //  => 
    //
    //
    //

Note that in both the `traverseDown` and the `traverseUp` methods, the
'iterator function passed as an argument is bount to the value of the
currently traversed `node`. The following produces the same output of 
the one listed above.

    tree.traverseUp(function () {
      console.info([this.depth, this.data.category].join(")"));
    }


## Search



## Manipulation

While traversing a tree, nodes can be deleted by calling the `remove` on
the node instance bound to the iterator.

   tree.length

   // => 7

   tree.traverseDown(function (item) {
     var toDelete = 'JavaScript produgramming languages family';
     if (item.data.category === toDelete) {
       this.remove();
     }
   });

   tree.length;

   // 5

## Development and testing


