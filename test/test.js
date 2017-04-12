/*jslint node: true */
/*global Arboreal*/

'use strict';

function appendSomeChildren(tree) {
    tree
            .appendChild()
            .appendChild()
            .appendChild()
            .appendChild();

    tree.children[0]
            .appendChild()
            .appendChild();
}


QUnit.test("#new()", function (assert) {

    var tree = new Arboreal();
    assert.ok(tree.id === '0', '#new()');
});

QUnit.test("#new(null, {myAttr: true}, 'myId')", function (assert) {


    var tree = new Arboreal(null, {myCustomAttr: true}, "myId");
    assert.ok(tree.id === 'myId', "id");
    assert.ok(tree.data.myCustomAttr, "myCustomAttr");
});

QUnit.test("#parse(data, 'someId')", function (assert) {

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

    var tree = Arboreal.parse(data, 'subcategories');
    assert.ok(tree.length === 7, "tree.length");

    var subData = {
        category: 'C#',
        subcategories: [
            {category: 'WinForms'},
            {category: 'WPF',
                subcategories: [{
                        category: 'XAML markup'
                    }]
            },
        ]
    };
    tree = Arboreal.parse(data, 'subcategories');
    var biggerTree = Arboreal.parse(subData, 'subcategories', tree.children[1]);

    assert.ok(biggerTree.children[0].length === 4, "biggerTree.children[0].length");
    assert.ok(tree.length === 11, "tree.length");

    assert.ok(tree.children[1].children[0].data.category === 'C#', "tree.children[1].children[0].data.category");

});

QUnit.test("#appendChild(null, 'bla')", function (assert) {
    var tree = new Arboreal();
    tree.appendChild({myCustomAttr: true}, "myId");

    assert.ok(tree.children.length === 1, "tree.children.length");
    assert.ok(tree.children[0].id === "myId", "tree.children[0].id");
    assert.ok(tree.children[0].parent === tree, "tree");

});

QUnit.test("#appendChildren to root", function (assert) {
    var tree = new Arboreal();
    tree.appendChildren({testAttr: 'subroot', subitems: [{testAttr: 'firstChild'}]}, "subitems");

    assert.ok(tree.length === 3, "tree.children.length");
    assert.ok(tree.children[0].data.testAttr === "subroot", "tree.children[0].data.testAttr");
    assert.ok(tree.children[0].children[0].data.testAttr === "firstChild", "tree.children[0].children[0].data.testAttr");

});

QUnit.test("#appendChildren to children", function (assert) {
    var tree = new Arboreal();
    tree.appendChild().appendChild();
    tree.children[1].appendChildren({testAttr: 'secondchild', subitems: [{testAttr: 'third child'}]}, "subitems");
    assert.ok(tree.length === 5);
    assert.ok(tree.children[1].children[0].data.testAttr === "secondchild");
    assert.ok(tree.children[1].children[0].children[0].data.testAttr === 'third child');

});

QUnit.test("#removeChild()", function (assert) {

    var tree = new Arboreal(),
            thirdChild,
            secondChild;

    appendSomeChildren(tree);

    thirdChild = tree.children[2];
    secondChild = tree.children[0].children[1];

    assert.ok(tree.removeChild(thirdChild) === thirdChild);
    assert.ok(tree.children.length === 3);
    assert.ok(tree.children[2].id === "0/3");


    assert.ok(tree.children[0].removeChild(1).id === secondChild.id);

});

QUnit.test("#traverseDown", function (assert) {
    var tree = new Arboreal(),
            callbackCounter = 0,
            callbackCounter2 = 0;

    appendSomeChildren(tree);

    tree.traverseDown(function () {
        this.id = "_" + this.id;
    });

    assert.ok(tree.id === '_0');
    assert.ok(tree.children[0].id === '_0/0');
    assert.ok(tree.children[3].id === '_0/3');

    tree = new Arboreal();
    appendSomeChildren(tree);

    tree.traverseDown(
            function () {
                this.id = "_" + this.id;
            },
            function () {
                this.id = this.id + "=";
            }
    );

    assert.ok(tree.id === '_0');
    assert.ok(tree.children[0].id === '_0/0=');
    assert.ok(tree.children[3].id === '_0/3=');


    //expect to stop traversing when the iterator returns a falsy value

    tree.traverseDown(function () {
        callbackCounter++;
        if (callbackCounter === 3) {
            return false;
        }
    });

    assert.ok(callbackCounter === 3);


    callbackCounter = 0;
    tree = new Arboreal();
    appendSomeChildren(tree);

    tree.traverseDown(
            function () {
                callbackCounter++;
                if (callbackCounter === 3) {
                    return false;
                }
            },
            function () {
                callbackCounter2++;
            }
    );

    assert.ok(callbackCounter === 3);
    assert.ok(callbackCounter2 === 6);

});


QUnit.test("#traverseUp", function (assert) {

    var tree = new Arboreal();

    var treeIds = [];

    var appendId = function (node) {
        treeIds.push(node.id);
    };

    var iterations = 0;
    var countIterations = function () {
        iterations++;
    };

    appendSomeChildren(tree);
    tree.traverseUp(countIterations);
    //should iterate over itself and its child elements
    assert.ok(iterations === 1 + 4);

    //should traverse all the nodes in the tree
    iterations = 0;
    tree.children[0].children[1].traverseUp(countIterations);
    assert.ok(iterations === tree.toArray().length);

    //should traverse all the nodes in the right order
    tree.children[0].children[1].traverseUp(appendId);

    assert.ok(treeIds.shift() === "0/0/1");
    assert.ok(treeIds.pop() === "0/3");

    treeIds = [];
    //should break when iterator returns a falsy value
    tree.traverseUp(function (node) {
        appendId(node);
        if (treeIds.length === 3) {
            return false;
        }
    });
    assert.ok(treeIds.length === 3);
});

QUnit.test("#bubbleUp", function (assert) {

    var tree = new Arboreal();
    var treeIds = [];

    var appendId = function (node) {
        treeIds.push(node.id);
    };

    var iterations = 0;
    var countIterations = function () {
        iterations++;
    };


    appendSomeChildren(tree);
    tree.bubbleUp(countIterations);
    //should iterate over itself
    assert.ok(iterations = 1);

    //should bubble up to the root
    iterations = 0;
    tree.children[0].children[1].bubbleUp(countIterations);
    assert.ok(iterations === 1 + 1 + 1);

    //should bubble up in the right order
    tree.children[0].children[1].bubbleUp(appendId);

    assert.ok(treeIds.shift() === "0/0/1");

    treeIds = [];
    //should break when iterator returns a falsy value
    tree.bubbleUp(function (node) {
        appendId(node);
        if (treeIds.length === 2) {
            return false;
        }
    });
    assert.ok(treeIds.length === 1);
});


QUnit.test("#toArray", function (assert) {
    var tree = new Arboreal();

    appendSomeChildren(tree);

    assert.ok(tree.toArray().length === 7);

    assert.ok(tree
            .toArray()
            .map(function (node) {
                return node.id;
            })
            .every(function (id) {
                return id.length;
            })
            );
});

QUnit.test("#find", function (assert) {
    var tree = new Arboreal();
    appendSomeChildren(tree);

    assert.ok(tree.find("0/3").id === "0/3");
    assert.ok(tree.find(function () {
        return this.depth === 2;
    }).id === "0/0/0");
});

QUnit.test("#path", function (assert) {
    var tree = new Arboreal();

    appendSomeChildren(tree);

    //should automatically strip out the '/' prefix
    assert.ok(tree.path("/3").id === "0/3");
    assert.ok(tree.path("0/1").id === "0/0/1");
});