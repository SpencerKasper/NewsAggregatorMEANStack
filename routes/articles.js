var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/HW4');

// Get all articles
router.get('/', function(req, res){
    var collection = db.get('articles');
    collection.find({}, function(err,articles){
        if (err) throw err;
        res.json(articles);
    });
});

// Get one article based on ID
router.get('/:articleid',function(req, res){
    var collection = db.get('articles');
    collection.findOne({_id: req.params.articleid}, function(err,article){
        if(err) throw err;
        res.json(article);
    });
});

// Add an article
router.post('/', function(req, res){
    var collection = db.get('articles');
    collection.insert({
        title: req.body.title,
        URL: req.body.URL,
        votes: 0,
        user: req.body.userName,
        comments: []
    }, function(err, article){
        if(err) throw err;

        res.json(article);
    });
});

// Delete an article
router.delete('/:articleid', function(req,res){
    var collection = db.get('articles');
    collection.remove({_id: req.params.articleid }, function(err, article){
        if(err) throw err;

        res.json(article);
    });
});

// Delete a comment from an article
router.delete('/:articleid/:commentid', function(req,res){
    var collection = db.get('articles');

    collection.findOne({_id: req.params.articleid}, function(err, article){
        if(err) throw err;
        var index = 0;

        if(article.comments != null){
            for(var i = 0; i < article.comments.length; i++){
                if(article.comments[i]._id == req.params.commentid){
                    index = i;
                }
            }

            article.comments.splice(index, 1);
            
            collection.findOneAndUpdate({_id: req.params.articleid}, {$set:{comments: article.comments}},
                function(err, article){
                    if(err) throw err;

                    res.json(article);
                })
        }
    })
});

// Get a comment from a specific article
router.get('/:articleid/:commentid', function(req,res){
    var collection = db.get('articles');

    collection.findOne({_id: req.params.articleid}, function(err, article){
        if (err) throw err;

        if(article.comments != null){
            for(var i = 0; i < article.comments.length; i++){
                if(article.comments[i]._id == req.params.commentid){
                    res.json(article.comments[i]);
                }
            }
        }
    })
})

// Add a comment to an article
router.post('/:articleid', function(req,res){
    var collection = db.get('articles');

    // Get todays date
    var day = new Date();
    var month = parseInt(day.getMonth()) + 1;
    month.toString();
    var date = month + '/' + day.getDate() + '/' + day.getFullYear();
    
    // Generate the comment object
    var comment = {
        date: date,
        body: req.body.body,
        votes: 0,
        userName: req.body.userName,
        _id: 0
    };

    collection.findOne({_id: req.params.articleid}, function(err,article){
        if(err) throw err;
        
        if(article.comments != null){
            // Get the largest id value
            var largest = 0;

            for(var i = 0; i < article.comments.length; i++){
                if(article.comments[i]._id > largest){
                    largest = article.comments[i]._id;
                }
            }

            // Set the comment id to one more than the largest
            comment._id = largest + 1;
        }

        article.comments.push(comment);

        collection.findOneAndUpdate({_id: req.params.articleid}, {$set:{comments: article.comments}},
            function(err,article){
                res.json(article);
            })
    })  
});

// Update votes for articles
router.post('/:articleid/:votes', function(req,res){
    var collection = db.get('articles');

    collection.findOneAndUpdate({_id: req.params.articleid}, {$set:{votes: req.params.votes}},
        function(err,article){
            res.json(article);
        }
    )
})

// Update votes for comments
router.post('/:articleid/:commentid/:votes', function(req,res){
    var collection = db.get('articles');

    collection.findOne({_id: req.params.articleid}, function(err, article){
        if (err) throw err;

        if(article.comments != null){
            var index = 0;

            for(var i = 0; i < article.comments.length; i++){
                if(article.comments[i]._id == req.params.commentid){
                    article.comments[i].votes = req.params.votes;
                    index = i;
                }
            }

            collection.findOneAndUpdate({_id: req.params.articleid}, {$set:{comments: article.comments}},
                function(err,article){
                    res.json(article);
                })
        }
    })
})

module.exports = router;