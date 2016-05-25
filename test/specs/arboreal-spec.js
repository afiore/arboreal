if (typeof require !== 'undefined') {
  util = require("util");
  Arboreal = require('../../lib/arboreal');
}

function appendSomeChildren (tree) {
  tree
    .appendChild()
    .appendChild()
    .appendChild()
    .appendChild();

  tree.children[0]
    .appendChild()
    .appendChild();
}

describe("Arboreal", function () {
  it("#new()", function () {
    var tree = new Arboreal();
    expect(tree.id).toBe('0');
  });

  it("#new(null, {myAttr: true}, 'myId')", function () {
    var tree = new Arboreal(null, {myCustomAttr:true}, "myId");
    expect(tree.id).toBe("myId");
    expect(tree.data.myCustomAttr).toBeTruthy();
  });


  describe("#parse(data, 'someId')", function () {
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
    it("default parent", function () {
      var tree = Arboreal.parse(data, 'subcategories');
      expect(tree.length).toBe(7);
    });
    it("Arboreal parent", function () {
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
      var tree = Arboreal.parse(data, 'subcategories');
      var biggerTree = Arboreal.parse(subData, 'subcategories', tree.children[1]);
      expect(biggerTree.children[0].length).toBe(4);
      expect(tree.length).toBe(11);
      expect(tree.children[1].children[0].data.category).toBe('C#');
    });
  });

  it("#appendChild(null, 'bla')", function () {
    var tree = new Arboreal();
    tree.appendChild({myCustomAttr:true}, "myId" );
    expect(tree.children.length).toBe(1);
    expect(tree.children[0].id).toBe("myId");
    expect(tree.children[0].parent).toEqual(tree);
  });
  
  it("#appendChildren to root", function () {
    var tree = new Arboreal();
    tree.appendChildren({testAttr:'subroot', subitems:[{testAttr:'firstChild'}]}, "subitems" );
    expect(tree.length).toBe(3);
    expect(tree.children[0].data.testAttr).toBe("subroot");
    expect(tree.children[0].children[0].data.testAttr).toEqual('firstChild');
  });
  
  it("#appendChildren to children", function () {
    var tree = new Arboreal();
    tree.appendChild().appendChild()
    tree.children[1].appendChildren({testAttr:'secondchild', subitems:[{testAttr:'third child'}]}, "subitems");
    expect(tree.length).toBe(5);
    expect(tree.children[1].children[0].data.testAttr).toBe("secondchild");
    expect(tree.children[1].children[0].children[0].data.testAttr).toEqual('third child');
  });
  
  it("#removeChild()", function () {
    var tree = new Arboreal(),
        thirdChild,
        secondChild;

    appendSomeChildren(tree);

    thirdChild = tree.children[2];
    secondChild = tree.children[0].children[1];

    expect( tree.removeChild(thirdChild)).toBe(thirdChild);
    expect(tree.children.length).toBe(3);
    expect(tree.children[2].id).toBe("0/3");


    expect(tree.children[0].removeChild(1).id).toBe(secondChild.id);
  });

  it("#traverseDown", function () {
    var tree = new Arboreal(),
        callbackCounter = 0;

    appendSomeChildren(tree);

    tree.traverseDown(function () {
      this.id = "_" + this.id;
    });

    expect(tree.id).toBe('_0');
    expect(tree.children[0].id).toBe('_0/0');
    expect(tree.children[3].id).toBe('_0/3');

    //expect to stop traversing when the iterator returns a falsy value

    tree.traverseDown(function (node) {
      callbackCounter++;
      if (callbackCounter === 3) return false;
    });

    expect(callbackCounter).toBe(3);
  });

  it("#traverseUp", function () {
    var tree = new Arboreal(),
        callbackCounter=0,
        treeIds = [],
        spy1 = jasmine.createSpy(),
        spy2 = jasmine.createSpy(),
        appendId = function (node) {
          treeIds.push(node.id);
        };


    appendSomeChildren(tree);
    tree.traverseUp(spy1);
    //should iterate over itself and its child elements
    expect(spy1.callCount).toBe(1 + 4);

    //should traverse all the nodes in the tree
    tree.children[0].children[1].traverseUp(spy2);
    expect(spy2.callCount).toBe(tree.toArray().length);

    //should traverse all the nodes in the right order
    tree.children[0].children[1].traverseUp(appendId);

    expect(treeIds.shift()).toBe("0/0/1");
    expect(treeIds.pop()).toBe("0/3");

    treeIds = [];
    //should break when iterator returns a falsy value
    tree.traverseUp(function (node) {
      appendId(node);
      if (treeIds.length === 3) return false;
    });
    expect(treeIds.length).toBe(3);
  });
  
  it("#bubbleUp", function () {
    var tree = new Arboreal(),
        callbackCounter=0,
        treeIds = [],
        spy1 = jasmine.createSpy(),
        spy2 = jasmine.createSpy(),
        appendId = function (node) {
          treeIds.push(node.id);
        };


    appendSomeChildren(tree);
    tree.bubbleUp(spy1);
    //should iterate over itself
    expect(spy1.callCount).toBe(1);

    //should bubble up to the root
    tree.children[0].children[1].bubbleUp(spy2);
    expect(spy2.callCount).toBe(1+1+1);
    
    //should bubble up in the right order
    tree.children[0].children[1].bubbleUp(appendId);

    expect(treeIds.shift()).toBe("0/0/1");
    
    treeIds = [];
    //should break when iterator returns a falsy value
    tree.bubbleUp(function (node) {
      appendId(node);
      if (treeIds.length === 2) return false;
    });
    expect(treeIds.length).toBe(1);
  });

  it("#toArray", function () {
    var tree = new Arboreal();

    appendSomeChildren(tree);

    expect(tree.toArray().length).toBe(7);

    expect(tree
      .toArray()
      .map(function (node) {return node.id;})
      .every(function (id) { return id.length;})

    ).toBeTruthy();
  });

  it("#find", function () {
    var tree = new Arboreal();
    appendSomeChildren(tree);

    expect(tree.find("0/3").id).toBe("0/3");
    expect(tree.find(function () {
      return this.depth == 2;
    }).id).toBe("0/0/0");
  });

  it("#path", function () {
    var tree = new Arboreal(),
        treeArry;

    appendSomeChildren(tree);
    treeArray = tree.toArray();
    lastNode = treeArray[treeArray.length -1 ];

    //should automatically strip out the '/' prefix
    expect(tree.path("/3").id).toBe("0/3");
    expect(tree.path("0/1").id).toBe("0/0/1");
  });
});
