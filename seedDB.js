/**
 * Created by clh on 4/23/14.
 */

var fb = require('./foosAndBars');
var Foo = fb.Foo;
var Bar = fb.Bar;
var async = require('async');

//clear out old data

//Foo.remove({}, function(err) {
//    console.log('Foo collection cleaned out')
//});


var numBars = 10;
var bars = []
var numFoos=  10;
var numBarsPerFoo = 2;
var foos = [];

function makeBar(i){
    var b = new Bar({barValue:i, barValueNoIndex: i});
    console.log('saving Bar number ' + i);
    b.save(function(error){
        if (error){
            console.log(error);
        } else {
            console.log('saved Bar number ' + i);
            bars[i] = b;
        }
    });
}

function makeFoo(i,bars){
    var f = new Foo({fooValue:i, fooValueNoIndex:i, bars: bars});
    console.log('saving Foo number ' + i);
    f.save(function(error){
        if (error){
            console.log(error);
        } else {
            console.log('saved Foo number ' + i);
            foos[i] = f;
        }
    });
}

async.series([
    function(cb){
         Bar.remove({}, function(error){
             if (error) console.log(error);
             console.log('Bar collection cleaned out');
             cb(error);
         });
    },
    function(cb){
         Foo.remove({}, function(error){
             if (error) console.log(error);
             console.log('Foo collection cleaned out');
             cb(error);
         });
    },
    function(cb){//add the Bars
        for (var i = 0; i < numBars; i++){
            makeBar(i);
        }
        cb();
    },
    function(cb){
        console.log('Waiting for Bars');
        setTimeout(function(){cb()},5000);
    },
    function(cb){
        //add the Foos which reference a set of Bars
        for (var i = 0; i < numFoos; i++){
            var someBars = []
            for (var j = 0; j < numBarsPerFoo; j++){
                someBars.push(bars[j % numBars].id);
            }
            makeFoo(i,someBars);
        }
        cb();
    },
    function(cb){
        console.log('Waiting for Foos');
        setTimeout(function(){cb()},5000);
    }
], function(error){
    console.log('Exiting');
    process.exit()
});
