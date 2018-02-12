var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/message_board');
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;

var PostSchema = new mongoose.Schema({
  name: {type: String, required: true, minlength: 4},
  text: { type: String, required: true }, 
  comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, { timestamps: true });

mongoose.model('Post', PostSchema);
var Post = mongoose.model('Post')

var CommentSchema = new mongoose.Schema({
  name: {type: String, required: true, minlength: 4},
 _post: {type: Schema.Types.ObjectId, ref: 'Post'},
 text: { type: String, required: true },
}, {timestamps: true });

mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment')

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {	
    Post.find({}).populate('comments').exec(function(err, post) {
      if(err){
        console.log(err);
          res.render('index', {errors: user.errors})
        }
      console.log(post); 
      console.log(post[0].comments); 
      res.render('index', {list: post});
    });  
	});

app.post('/new', function(req, res) {
  console.log("POST DATA", req.body);
  var post = new Post({name: req.body.name, text: req.body.message});
  post.save(function(err) {
    if(err) {
      console.log('something went wrong');  
    }
    else{ 
      console.log('successfully added a post!');
    } 
    res.redirect('/');
  })
});

app.post('/new_comment', function(req, res) {
  console.log("POST DATA", req.body);
  Post.findOne({_id: req.body.post_id}, function(err, post){
    var comment = new Comment({name: req.body.name, text: req.body.comment});
    comment._post = post._id;
    post.comments.push(comment);
    comment.save(function(err){
      post.save(function(err){
        if(err) { 
          console.log('Error'); 
        } 
        else { 
          res.redirect('/'); 
        }
      });
    });
  });
});

app.listen(8000, function() {
    console.log("listening on port 8000");
});
