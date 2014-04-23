var fb = require('./foosAndBars');
var async = require('async');

var Foo = fb.Foo;
var Bar = fb.Bar;

function getAllBars(){
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
				console.log("Done! err: " + err);
				process.exit();
			});
	});
}

getAllBars();
