Welcome to the arboreal.js wiki!

## Usage

Add script to you webpage

```html

<script src="../lib/arboreal.min.js" type="text/javascript"></script>
```


Arboreal,js provides a set of methods for parsing, manipulating, and
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

### Parsing

Alternatively, Arboreal.js can also parse an existing object into a tree (though it will need to 
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

    var tree = Arboreal.parse(wikipediaJsCategory, 'subcategories');
    
Also several children (or even the whole tree) can be added at the same time (syntax is similar as parse)

    tree.children[1].appendChildren({category:'C#', subitems:[{category:'WPF'}]}, "subitems" );

### Traversal

An Arboreal.js object can be traversed either upwards or downwards.

    function iterator (node) {
      var depth = "", i;
      for (i = 1; i <= node.depth; i++) depth += ">>";
      console.info([depth, node.data.category].join(" "));
    }

#### Traverse down

    tree.traverseDown(iterator);

    // =>   JavaScript
    //      >> Ajax (programming)
    //      >> JavaScript engines
    //      >> JavaScript produgramming languages family
    //      >>>> JavaScript dialect engines
    //      >> JavaScript based calendar components
    //      >> JavaScript based HTML editors

#### Traverse up

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

#### Bubble Up
    
Arboreal object can be iterated up to the root using method 'bubbleUp':

    tree.children[2].children[0].bubbleUp(iterator)
    
    //  => >>>> JavaScript dialect engines
    //     >> JavaScript programming languages family
    //     JavaScript

### Advanced Traversal Down

What if we want to build HTML list from our tree? It not big deal, but there a 
catch - we need a way to close tags. So here solution for it:

    var rowStr = "<ul>";

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


    var tree = Arboreal.parse(wikipediaJsCategory, 'subcategories');


    function iterator(node) {
        if (node.children.length > 0)
        {
            rowStr += '';
            rowStr += '<li class="jstree-open">' + node.data.category + '<ul>';
        } else
        {
            rowStr += '<li>' + node.data.category + '</li>';
        }
    }

    function iteratorAfter(node) {
        if (node.children.length > 0)
        {

            rowStr += '</ul></li>';
        }
    }

    tree.traverseDown(iterator, iteratorAfter);

    rowStr += "</ul>";

Check [this demo]() to check how it works.

    
### Search

#### Find

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

#### Path

You can use node id to get actual Arboreal.js object. To do so use
`.path()` function

    tree.path("/2/0").data.category

    // => JavaScript dialect engines

If you use different separator for Id's then you must pass it as second parameter

    tree.path("_2_0","_").data.category

    // => JavaScript dialect engines

### Manipulation

While traversing a tree, nodes can be deleted by calling the `remove`
method on the node object bound to the iterator function.

    tree.length;

    // => 7

    tree.traverseDown(function (item) {
      var toDelete = 'JavaScript programming languages family';
      if (item.data.category === toDelete) {
        this.remove();
      }
    });

    tree.length;

    // 5
