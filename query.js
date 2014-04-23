/**
 * Created by clh on 4/23/14.
 */

var fb = require('./foosAndBars');
var async = require('async');

var Foo = fb.Foo;
var Bar = fb.Bar;
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;


//define query functions.
function getAllFoos(deferred){
   Foo.find({},function(error,docs){
       //call resolve to let benchmark know this async test is done.
       deferred.resolve();
   });
}


function getAllFoosPopulateBars(deferred){
   Foo.find({})
       .populate('bars')
       .exec(function(error,docs){
       //call resolve to let benchmark know this async test is done.
       deferred.resolve();
   });
}

function getAllBars(deferred){
   Bar.find({},function(error,docs){
       //call resolve to let benchmark know this async test is done.
       deferred.resolve();
   });
}

function getAllBarsWithFoos(deferred){
   Bar.find({},function(error, bars){
		async.each(bars, 
			function(bar, done) {
				bar.foos = [];
				Foo.find({bars: bar.id}, function(error, foos){
					for(var i = 0; i < foos.length; i++) {
						bar.foos.push(foos[i]);
					}
					//console.log(bar);
					//for(var i = 0; i < bar.foos.length; i++){ 
					//	console.log(bar.foos[i].fooValue);
					//}
					done();
				});
			}, 
			function(err){
			   //call resolve to let benchmark know this async test is done.
			   deferred.resolve();
			});
	});
}




// add tests, with Asnc deferred config
suite.add('Get All Foos', {
    defer: true,
    fn: function(deferred) {
        getAllFoos(deferred);
    }
})
.add('Get All Bars', {
    defer: true,
    fn: function(deferred) {
        getAllBars(deferred);
    }
})
.add('Get All Foos - with Bar population', {
    defer: true,
    fn: function(deferred) {
        getAllFoosPopulateBars(deferred);
    }
})
.add('Get All Bars - with Foo population', {
    defer: true,
    fn: function(deferred) {
        getAllBarsWithFoos(deferred);
    }
})
// add listeners
.on('cycle', function(event) {
    console.log(String(event.target));
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
    process.exit()
})
// run async
.run({ 'async': true });
