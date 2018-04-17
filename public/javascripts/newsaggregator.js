var app = angular.module('NewsAggregator',['ngResource','ngRoute']);

app.controller('HomeCtrl', ['$scope','$window','$resource','$routeParams',
    function($scope,$window,$resource,$routeParams){
        var Articles = $resource('/api/articles');
        var Article = $resource('/api/articles/:articleid');

        
        Articles.query(function(articles){
            $scope.articles = articles;
        });

        if($window.sessionStorage.loggedIn != null){
            $scope.loggedIn = $window.sessionStorage.loggedIn;
            $scope.userName = $window.sessionStorage.userName;
            $scope.userNameCheck = $window.sessionStorage.userName;
            $scope.isMod = $window.sessionStorage.isMod;
        }

        else{
            $scope.loggedIn = false;
            $scope.isMod = false;
            $window.sessionStorage.isMod = false;
        }

        $scope.upVote = function(articleid, votes){
            votes = parseInt(votes) + 1;

            Article.get({articleid: articleid}, function(article){
                article.votes = votes;
                var Vote = $resource('/api/articles/:articleid/:votes');
                Vote.save({articleid: articleid, votes: article.votes}, article, function(newArticle){
                    Articles.query(function(articles){
                        $scope.articles = articles;
                    });
                })
            })
        }

        $scope.downVote = function(articleid, votes){
            votes = parseInt(votes) - 1;

            Article.get({articleid: articleid}, function(article){
                article.votes = votes;
                var Vote = $resource('/api/articles/:articleid/:votes');
                Vote.save({articleid: articleid, votes: article.votes}, article, function(newArticle){
                    Articles.query(function(articles){
                        $scope.articles = articles;
                    });
                })
            })
        }

        $scope.signOut = function(){
            $window.sessionStorage.loggedIn = null;
            $window.sessionStorage.isMod = false;
            $window.sessionStorage.userName = null;
            $window.sessionStorage.firstName = null;
            $window.sessionStorage.lastName = null;

            $scope.loggedIn = $window.sessionStorage.loggedIn;
            $scope.isMod = false;
            $scope.userName = $window.sessionStorage.userName;
            $scope.firstName = $window.sessionStorage.firstName;
            $scope.lastName = $window.sessionStorage.lastName;
        }

        $scope.query = {}
        $scope.queryBy = 'title'
}])

app.controller('SignUpCtrl', ['$scope','$window','$resource','$location',
    function($scope,$window,$resource,$location){
        $scope.register = function(){
            var Users = $resource('/users');

            Users.save($scope.user, function(user){
                $location.path('/#/signIn');
            })
        }
    }])

app.controller('SignInCtrl', ['$scope','$window', '$resource', '$location', '$routeParams',
    function($scope,$window,$resource,$location,$routeParams){
        $scope.signIn = function(){
            var Users = $resource('/users/:userName');

            Users.get({userName: $scope.user.login},function(user){
                    if(user.userName == $scope.user.login && user.password == $scope.user.password){
                        $window.sessionStorage.loggedIn = true;
                        $window.sessionStorage.userName = user.userName;
                        $window.sessionStorage.firstName = user.firstName;
                        $window.sessionStorage.lastName = user.lastName;

                        if(user.type == 'Moderator'){
                            $window.sessionStorage.isMod = true;
                        }

                        else{
                            $window.sessionStorage.isMod = false;
                        }

                        $location.path('/');
                    }
            })
        }
    }])

app.controller('AddArticleCtrl', ['$scope','$window', '$resource', '$location',
    function($scope,$window, $resource, $location){
        $scope.save = function(){
            var Articles = $resource('/api/articles');
            var article = $scope.article;
            article.userName = $window.sessionStorage.userName;
            Articles.save(article, function(){
                $location.path('/');
            })
        }
    }])

app.controller('DeleteArticleCtrl', ['$scope', '$resource', '$location', '$routeParams',    
    function($scope, $resource, $location, $routeParams){
        var Article = $resource('/api/articles/:articleid');

        Article.get({articleid: $routeParams.articleid}, function(article){
            $scope.article = article;
        });

        $scope.delete = function(){
            Article.delete({articleid: $routeParams.articleid}, function(article){
                $location.path('/');
            });
        }
    }])

app.controller('CommentsCtrl', ['$scope','$window','$resource','$location','$routeParams',
    function($scope,$window,$resource,$location,$routeParams){
        var Article = $resource('/api/articles/:articleid');
    
        if($window.sessionStorage.loggedIn != null){
            $scope.loggedIn = $window.sessionStorage.loggedIn;
            $scope.userName = $window.sessionStorage.userName;
            $scope.isMod = $window.sessionStorage.isMod;
        }

        else{
            $scope.loggedIn = false;
            $scope.isMod = false;
            $window.sessionStorage.isMod = false;
        }

        Article.get({articleid: $routeParams.articleid}, function(article){
            $scope.article = article;
            $scope.date = new Date();
        });

        $scope.signOut = function(){
            $window.sessionStorage.loggedIn = null;
            $window.sessionStorage.isMod = false;
            $window.sessionStorage.userName = null;
            $window.sessionStorage.firstName = null;
            $window.sessionStorage.lastName = null;

            $scope.loggedIn = $window.sessionStorage.loggedIn;
            $scope.isMod = false;
            $scope.userName = $window.sessionStorage.userName;
            $scope.firstName = $window.sessionStorage.firstName;
            $scope.lastName = $window.sessionStorage.lastName;
            $location.path('/');
        }

        $scope.save = function(newComment){
            newComment.userName = $scope.userName;

            Article.save({articleid: $routeParams.articleid}, newComment, function(){
                Article.get({articleid: $routeParams.articleid}, function(article){
                    $scope.article = article;
                })
            })

            
        }

        $scope.upVote = function(commentid, votes){
            votes = parseInt(votes) + 1;
            var Comment = $resource('api/articles/:articleid/:commentid');

            Comment.get({articleid: $routeParams.articleid, commentid: commentid}, function(article){
                article.votes = votes;
                var Vote = $resource('/api/articles/:articleid/:commentid/:votes');
                Vote.save({articleid: $routeParams.articleid, commentid: commentid, votes: article.votes}, article, function(newArticle){
                    Article.get({articleid: $routeParams.articleid}, function(article){
                        $scope.article = article;
                    })
                })
            })
        }

        $scope.downVote = function(commentid, votes){
            votes = parseInt(votes) - 1;
            var Comment = $resource('api/articles/:articleid/:commentid');

            Comment.get({articleid: $routeParams.articleid, commentid: commentid}, function(article){
                article.votes = votes;
                var Vote = $resource('/api/articles/:articleid/:commentid/:votes');
                Vote.save({articleid: $routeParams.articleid, commentid: commentid, votes: article.votes}, article, function(newArticle){
                    Article.get({articleid: $routeParams.articleid}, function(article){
                        $scope.article = article;
                    })
                })
            })
        }

        $scope.query = {};
        $scope.queryBy = 'userName';

    $scope.sortFunc = function(comment){
        return -1 * parseInt(comment.votes);
    };
}])

app.controller('DeleteCommentCtrl', ['$scope', '$resource', '$location', '$routeParams',    
    function($scope, $resource, $location, $routeParams){
        var Article = $resource('/api/articles/:articleid/:commentid');
        var articleGlobal = [];

        Article.get({articleid: $routeParams.articleid, commentid: $routeParams.commentid}, function(comment){
            $scope.comment = comment;
            $scope.articleid = $routeParams.articleid;
        });

        $scope.delete = function(){
            Article.delete({articleid: $routeParams.articleid, commentid: $routeParams.commentid}, function(article){
                $location.path('/viewcomments/' + $routeParams.articleid);
            })
        }
    }])

app.controller('MakeModCtrl', ['$scope', '$resource', '$location', '$window', '$routeParams',
    function($scope,$resource,$location,$window,$routeParams){
        var Users = $resource('/users');
        var User = $resource('/users/:userName/:type');

        if($window.sessionStorage.loggedIn != null){
            $scope.loggedIn = $window.sessionStorage.loggedIn;
            $scope.userName = $window.sessionStorage.userName;
            $scope.userNameCheck = $window.sessionStorage.userName;
            $scope.isMod = $window.sessionStorage.isMod;
        }

        else{
            $scope.loggedIn = false;
            $scope.isMod = false;
            $window.sessionStorage.isMod = false;
        }

        Users.query(function(users){
            var regs = [];
            var mods = [];

            users.forEach(user => {
                if(user.type == 'Moderator'){
                    mods.push(user);
                }

                else{
                    regs.push(user);
                }
            });

            $scope.mods = mods;
            $scope.users = regs;
        });

        $scope.makeModerator = function(selectedUser){
            User.save({userName: selectedUser.userName, type: 'Moderator'}, selectedUser, function(newUser){
                alert(selectedUser.userName + ' has been successfully added as a moderator.');
                Users.query(function(users){
                var regs = [];
                var mods = [];

                users.forEach(user => {
                    if(user.type == 'Moderator'){
                        mods.push(user);
                    }

                    else{
                        regs.push(user);
                    }
                });

                $scope.mods = mods;
                $scope.users = regs;
                });
            })
        }

        $scope.removeModerator = function(selectedUser){
            User.save({userName: selectedUser.userName, type: 'Regular'}, selectedUser, function(newUser){
                alert(selectedUser.userName + ' has been successfully removed as a moderator.');
                Users.query(function(users){
                var regs = [];
                var mods = [];

                users.forEach(user => {
                    if(user.type == 'Moderator'){
                        mods.push(user);
                    }

                    else{
                        regs.push(user);
                    }
                });

                $scope.mods = mods;
                $scope.users = regs;
                });
            })
        }

        $scope.signOut = function(){
            $window.sessionStorage.loggedIn = null;
            $window.sessionStorage.isMod = false;
            $window.sessionStorage.userName = null;
            $window.sessionStorage.firstName = null;
            $window.sessionStorage.lastName = null;

            $scope.loggedIn = $window.sessionStorage.loggedIn;
            $scope.isMod = false;
            $scope.userName = $window.sessionStorage.userName;
            $scope.firstName = $window.sessionStorage.firstName;
            $scope.lastName = $window.sessionStorage.lastName;
            $location.path('/');
        }
    }])

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'partials/Home.html',
            controller: 'HomeCtrl'
        })
        .when('/add', {
            templateUrl: 'partials/article-form.html',
            controller: 'AddArticleCtrl'
        })
        .when('/article/delete/:articleid', {
            templateUrl: 'partials/article-delete.html',
            controller: 'DeleteArticleCtrl'
        })
        .when('/viewcomments/:articleid', {
            templateUrl: 'partials/comments.html',
            controller: 'CommentsCtrl'
        })
        .when('/viewcomments/delete/:articleid/:commentid', {
            templateUrl: 'partials/comment-delete.html',
            controller: 'DeleteCommentCtrl'
        })
        .when('/signIn', {
            templateUrl: 'partials/sign-in.html',
            controller: 'SignInCtrl'
        })
        .when('/signUp', {
            templateUrl: 'partials/sign-up.html',
            controller: 'SignUpCtrl'
        })
        .when('/moderator/makeModerator', {
            templateUrl: 'partials/assign-moderator.html',
            controller: 'MakeModCtrl'
        })
        .otherwise({
            redirectTo: '/'
        })
}])