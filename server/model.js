var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var uploadsSchema = mongoose.Schema({
    'file_id' : String,
    'city'    : String,
    'url'     : String

});

var uploads = mongoose.model('uploads', uploadsSchema);
exports.Uploads = uploads;
