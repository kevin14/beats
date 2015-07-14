var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var uploadsSchema = mongoose.Schema({
    'file_id'     : String,
    'city'        : String,
    'url'         : String,
    'created_at'  : { type: Date, default: Date.now }
});

var uploads = mongoose.model('uploads', uploadsSchema);
exports.Uploads = uploads;


var postsSchema = mongoose.Schema({
    photo : String,
    type  : String,
    title : String,
    text  : String,
    'created_at'  : { type: Date, default: Date.now }
});

var posts = mongoose.model('posts', postsSchema);
exports.Posts = posts;
