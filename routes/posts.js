//routes/posts.js

var express = require('express');
var router = express.Router();
var Post = require('../models/Post');
var Comment = require('../models/Comment');
var util = require('../util');

// new Index after Pages
router.get('/', async function (req, res){
	var page = Math.max(1, parseInt(req.query.page));
	var limit = Math.max(1, parseInt(req.query.limit));
	page = !isNaN(page)?page:1;
	limit = !isNaN(limit)?limit:10;

	var skip = (page-1)*limit;
	var count = await Post.countDocuments({});
	var maxPage = Math.ceil(count/limit);
	var posts = await Post.find({})
		.populate('author')
		.sort('-createdAt')
		.skip(skip)
		.limit(limit)
		.exec();
	
		res.render('posts/index', {
			posts:posts, 
			currentPage:page, 
			maxPage:maxPage, 
			limit:limit
		})
})

// New get /posts/new page , create post according to data /posts 
router.get('/new', util.isLoggedin, function (req, res) {
	var post = req.flash('post')[0] || {};
	var errors = req.flash('errors')[0] || {};
	res.render('posts/new', {post:post, errors:errors});
})

// create
router.post('/', util.isLoggedin, function (req, res) {
	req.body.author = req.user._id; // post-author connection
	Post.create(req.body, function(err, post){
		if (err) {
			req.flash('post', req.body);
			req.flash('errors', util.parseError(err));
			return res.redirect('/posts/new'+res.locals.getPostQueryString());
		}
		res.redirect('/posts'+res.locals.getPostQueryString(false, {page:1}));
	});
});

// show
router.get('/:id', function(req, res){ // 2
	var commentForm = req.flash('commentForm')[0] || {_id: null, form: {}};
	var commentError = req.flash('commentError')[0] || { _id:null, parentComment: null, errors:{}};
  
	Promise.all([
		Post.findOne({_id:req.params.id}).populate({ path: 'author', select: 'username' }),
		Comment.find({post:req.params.id}).sort('createdAt').populate({ path: 'author', select: 'username' })
	  ])
	  .then(([post, comments]) => {
		var commentTrees = util.converToTrees(comments, '_id', 'parentComment', 'childComments');
		res.render('posts/show', { post:post, commentTrees:commentTrees, commentForm:commentForm, commentError:commentError});
	  })
	  .catch((err) => {
		console.log('err: ', err);
		return res.json(err);
	  });
  });
  

// edit
router.get('/:id/edit', util.isLoggedin, checkPermission, function (req, res) {
	var post = req.flash('post')[0];
	var errors = req.flash('errors')[0] || {};
	if (!post){
		Post.findOne({_id:req.params.id}, function (err, post){
			if (err) return res.json(err);
			res.render('posts/edit', {post:post, errors:errors})
		})
	} else {
		post._id = req.params.id;
		res.render('posts/edit', {post:post, errors:errors});
	}
})

// update
router.put('/:id', util.isLoggedin, checkPermission, function (req, res){
	req.body.updatedAt = Date.now();
	Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function (err, result){
		if (err) {
			req.flash('post', req.body);
			req.flash('errors', util.parseError(err));
			return res.redirect('/posts/'+req.params.id+'/edit'+res.locals.getPostQueryString());
		}
		res.redirect("/posts/"+req.params.id+res.locals.getPostQueryString());
	})
})

//delete
router.delete('/:id', util.isLoggedin, checkPermission, function(req, res){
	Post.deleteOne({_id:req.params.id}, function (err, result){
		if (err) return res.json(err);
		res.redirect('/posts'+res.locals.getPostQueryString());
	})
})

module.exports = router;

//private functions 
function checkPermission(req, res, next){
	Post.findOne({_id:req.params.id}, function(err, post){
		if (err) return res.json(err);
		if (post.author != req.user.id) return util.noPermission(req, res);

		next();
	});
}