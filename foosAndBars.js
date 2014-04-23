/**
 * Created by clh on 4/23/14.
 */

var mongoose = require('mongoose');

// Connect the database
var db = mongoose.createConnection('mongodb://127.0.0.1:27017/foos_and_bars');
db.on('error', function (err) {
    console.log('Mongo connection error! Abort!');
});
db.once('open', function () {
    console.log('Mongo connection successful.');
});



var BarSchema= new mongoose.Schema({
    barValue: {type:Number,required:true,index:true},
    barValueNoIndex: {type:Number,required:true,index:false}
});
var Bar = db.model('Bar', BarSchema);


var FooSchema = new mongoose.Schema({
    fooValue: {type:Number,required:true,index:true},
    fooValueNoIndex: {type:Number,required:true,index:false},
    bars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bar'}]
});
var Foo = db.model('Foo', FooSchema);



exports.Foo = Foo;
exports.Bar = Bar;

