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
    videoId       : String,

    // english
    title_en      : String,
    text_en       : String,

    // german
    title_de      : String,
    text_de       : String,

    // french
    title_fr      : String,
    text_fr       : String,

    // japanese
    title_jp      : String,
    text_jp       : String,

    // chinese simplified
    title_cs      : String,
    text_cs       : String,

    // chinese traditional
    title_ct      : String,
    text_ct       : String,

    'created_at'  : { type: Date, default: Date.now }
});

var posts = mongoose.model('posts', postsSchema);
exports.Posts = posts;
