
var lambs;
var defs;
var getDefs;
var updateDefs;

require(['lambs'], function (foo) {
    lambs = foo;

    defs = lambs.noDefs;
    updateDefs = function (d) {
      defs = lambs.updateDefs(d)(defs);
    };
});
