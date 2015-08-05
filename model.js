var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var shortid = require('shortid');

var uploadsSchema = mongoose.Schema({
  _id             : {
                      type: String,
                      unique: true,
                      'default': shortid.generate
                    },
    'file_id'     : String,
    'city'        : String,
    'url'         : String,
    'created_at'  : { type: Date, default: Date.now }
});

var uploads = mongoose.model('uploads', uploadsSchema);
exports.Uploads = uploads;


var postsSchema = mongoose.Schema({
    photo         : String,
    type          : String,
    title         : String,
    text          : String,
    videoId       : String,
    'created_at'  : { type: Date, default: Date.now }
});

var posts = mongoose.model('posts', postsSchema);
exports.Posts = posts;
