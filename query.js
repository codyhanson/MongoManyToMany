/**
 * Created by clh on 4/23/14.
 */

var fb = require('./foosAndBars');
var async = require('async');
var mongoose = require('mongoose');

var Foo = fb.Foo;
var Bar = fb.Bar;
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;


//define query functions.
function getAllFoos(deferred) {
    Foo.find({}, function (error, docs) {
        //call resolve to let benchmark know this async test is done.
        deferred.resolve();
    });
}


function getAllFoosPopulateBars(deferred) {
    Foo.find({})
        .populate('bars')
        .exec(function (error, docs) {
            //call resolve to let benchmark know this async test is done.
            deferred.resolve();
        });
}

function getAllBars(deferred) {
    Bar.find({}, function (error, docs) {
        //call resolve to let benchmark know this async test is done.
        deferred.resolve();
    });
}

function getAllBarsWithFoos(deferred) {
    Bar.find({}, function (error, bars) {
        async.each(bars,
            function (bar, done) {
                Foo.find({bars: bar.id}, function (error, foos) {
                    bar.foos = foos;
                    done();
                });
            },
            function (err) {
                //call resolve to let benchmark know this async test is done.
                deferred.resolve();
            });
    });
}

function getBarsWithFoosMinQueries(query, deferred) {
    var barIds;
    async.series([
            // Query bars and stash barIds
            function (callback) {
                Bar.find(query, function (err, bars) {
                    if (!err) {
                        barIds = bars.map(function (bar) { return mongoose.Types.ObjectId(bar.id); });
                    }
                    callback(err, bars);
                });
            },
            // Query foos grouped by barIds
            function (callback) {
                Foo.aggregate({ $match: {bars: {$in: barIds}}})
                    .unwind("bars")
                    .match({bars: {$in: barIds}})
                    .group({_id: "$bars", foos: {$push: "$$ROOT"}})
                    .exec(function (err, fooGroups) {
                        if (!err) {
                            var foosByBar = {};
                            for (var i = 0; i < fooGroups.length; i++) {
                                foosByBar[fooGroups[i]._id] = fooGroups[i].foos;
                            }
                            callback(err, foosByBar);
                        }
                        else {
                            callback(err, fooGroups);
                        }
                    });
            }
        ],

        function (err, results) {
            var queryResults = [];
            if (!err) {
                var bars = results[0];
                var foos = results[1];
                for (var i = 0; i < bars.length; i++) {
                    var bar = bars[i]._doc;
                    bar.foos = foos[bar._id];
                    queryResults.push(bar);
                }
            }
            else {
                console.log(err);
            }
            deferred.resolve();
        });
}

// add tests, with Asnc deferred config
suite
    .add('Get All Foos', {
        defer: true,
        fn: function (deferred) {
            getAllFoos(deferred);
        }
    })
    .add('Get All Bars', {
        defer: true,
        fn: function (deferred) {
            getAllBars(deferred);
        }
    })
    .add('Get All Foos - with Bar population', {
        defer: true,
        fn: function (deferred) {
            getAllFoosPopulateBars(deferred);
        }
    })
    .add('Get All Bars - with Foo population', {
        defer: true,
        fn: function (deferred) {
            getAllBarsWithFoos(deferred);
        }
    })
    .add('Get All Bars - with Foo population, min queries', {
        defer: true,
        fn: function (deferred) {
            getBarsWithFoosMinQueries({}, deferred);
        }
    })

// add listeners
    .on('cycle', function (event) {
        console.log(String(event.target));
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').pluck('name'));
        process.exit()
    })
// run async
    .run({ 'async': true });
