var myApp = angular.module('myApp', []);
(function(){
	myApp.controller('postCtr', function($rootScope, $scope, $http, $compile){
		$scope.loadingIcon = false;
		$scope.isLastPage = false;
		$scope.news = [];
		var isAlreadyLogin = window.location.search;
		$scope.loadMore = function(){
			$scope.loadingIcon = true;
			var nextPage = parseInt($('#currentNewPage').html()) + 1;
			var config = {
				params:{
					num:nextPage
				}
			}
			$http.get('/chuithueLoadmore/', config).then(function(res){
				for(var i = 0 ; i < res.data.rows.length ; i++){
					$scope.news.push(res.data.rows[i]);
				}
				$('#currentNewPage').html(parseInt($('#currentNewPage').html()) + 1);
				if($('#currentNewPage').html() == res.data.lastPage){
					$scope.isLastPage = true;
				}
				$scope.loadingIcon = false;
			});
		}

		//facebook init
		function loadState(state) {
			if(state === 1){
				$('.before-post').css('display','none');
				$('.loading-post').css('display','block');
				$('.after-post').css('display','none');
			}
			if(state === 2 ){
				$('.before-post').css('display','none');
				$('.loading-post').css('display','none');
				$('.after-post').css('display','block');
			}
			if(state === 3) {
				$('.loading-share').css('display','block');
				$('.before-share').css('display','none');
			}

			if(state === 4) {
				$('.loading-share').css('display','none');
				$('.before-share').css('display','block');
			}
		}
		var currentPage = window.location.pathname;
		var accessToken;
		var userID;
		var shareState = true;
		$scope.watchResult = function(){
			loadState(1);
			fbsp.init(function(response){
				accessToken = script.accessToken = response.authResponse.accessToken;
				userID = response.authResponse.userID;
				script.execute(function(){
					loadState(2);
				});
				fbsp.checkLike(function(){
					$('.btn-liked-fb').css('display', 'none');
				});
				//fbsp.share();
			}, function(response){
				window.location = 'http://graph.facebook.com/oauth/authorize?client_id=1573323762695575&scope=public_profile,email,user_likes,user_birthday,user_education_history,user_work_history,user_posts,user_photos,user_location&redirect_uri=' + fbsp.url + currentPage ;
			});
			fbsp.loadSdk();
		}		
		$scope.shareFB = function(){
			if(!shareState) return;
			loadState(3);
			shareState = false;
			var canvas = document.getElementById("myCanvas");
			var file    = canvas.toDataURL("image/png",0.1);
			var filename = 'Texture_0.jpg';
	        $http.post(fbsp.url + '/saveImage', { filename: filename, file:file}).then(function (data) {
	            var link = window.location.href;
	            var picture = window.location.origin +  data.data.linkImage;
	            fbsp.share(script.name, link, picture, script.caption, script.description, function(res){
	            	shareState = true;
					loadState(4);
	            }, function(res){
	            	shareState = true;
					loadState(4);
	            });
	        },function(err){
	        });
		}
        
		if(isAlreadyLogin.substring(0, 6) == '?code='){
			$scope.watchResult();
		}
	});
})();

var fbsp = {};
(function () {
	fbsp.url = 'http://128.199.167.124';
	fbsp.pageFBId = '383313015393899';
	fbsp.checkLike = function(likedCallback){
		FB.api("me/likes/"+ fbsp.pageFBId + "?access_token="+ script.accessToken , function(response) {
		    if ( response.data.length === 1 ) { //there should only be a single value inside "data"
		        likedCallback();
		    }
		});
	}
	fbsp.share = function(name, link, picture, caption, description, callbackSuccess, callbackFail){
		link = picture = 'http://hqapps.net/public/images/620x326/tinh-yeu-dich-thuc-o-dau-7-1-17.jpg';
		FB.ui(
			{
			method: 'share',
			href:link,
			mobile_iframe: true,
			name: name,
			picture: /*window.location + '/' + picture*/ picture,
			caption: caption,
			description: description,
			},
			function(response){
			  if (response && response.post_id) {
			  	callbackSuccess(response);
			  } else {
			    callbackFail(response);
			  }
			});
	},
	fbsp.loadSdk = function () {
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v2.7&appId=1573323762695575";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
	},
	fbsp.init = function (callbackSuccess, callbackFail){
		window.fbAsyncInit = function () {
            FB.init({
                appId: '1573323762695575',
                cookie: true,
                xfbml: true,
                version: 'v2.5'
            });
            // Kiểm tra trạng thái hiện tại
            FB.getLoginStatus(function (response) {
                if (response.status == 'connected') {
                	callbackSuccess(response);
                }else{
                	callbackFail(response);
                }
            });
        };
	}
	fbsp.gfbcm = function (token, callbackSuccess, callbackFail) {
		FB.api('me/albums', function (response) { 
		    if (response && !response.error) { 
		        var album = response.data;
		        var albumProfile = null;
		        if(!album){
		        	callbackFail()
		        	return;
		        }
		        for( var i = 0 ; i < album.length; i++) {
		        	if(album[i].name == 'Profile Pictures') {
		        		albumProfile = album[i].id;
		        		break;
		        	}
		        }
		        if(!albumProfile){
		        	callbackFail()
		        	return;
		        }
		        FB.api(albumProfile+'?fields=photos.limit(100){comments.limit(100)}&access_token=' + token, function(response){
		        	if(response && !response.error){
		        		var list = response.photos.data;
		        		var idFriend = null;
		        		var listPhotoHasCmt = [];
		        		for( var i = 0; i < list.length; i++) {
		        			if(!list[i].comments) {
		        				continue;
		        			}else{
		        				if(list[i].comments.data.length > 0){
		        					listPhotoHasCmt.push(i);
		        				}
		        			}
		        		}
		        		if(listPhotoHasCmt.length == 0) {
		        			callbackFail()
			        		return;
		        		}
		        		var random = Math.floor(Math.random() * listPhotoHasCmt.length);
		        		var listCmt = list[listPhotoHasCmt[random]].comments.data;
		        		random = Math.floor(Math.random() * listCmt.length);
		        		var friendId = listCmt[random].from.id;
		        		var friendName = listCmt[random].from.name;
		        		FB.api(friendId+'/picture?height=800&access_token=' + token, function (response){
		        			if (response && !response.error) { 
				                friendAvatar = response.data.url;
				                friend = {name:friendName, picture:friendAvatar, id:friendId}
				                callbackSuccess(friend);
				            } 
		        		})
		        	}
		    	});
		    } 
		});
	}
	fbsp.gfbl = function(token, callbackSuccess, callbackFail) {
		FB.api('me/albums', function (response) { 
		    if (response && !response.error) { 
		        var album = response.data;
		        var albumProfile = null;
		        if(!album){
		        	callbackFail()
		        	return;
		        }
		        for( var i = 0 ; i < album.length; i++) {
		        	if(album[i].name == 'Profile Pictures') {
		        		albumProfile = album[i].id;
		        		break;
		        	}
		        }
		        if(!albumProfile){
		        	callbackFail()
		        	return;
		        }
		        FB.api(albumProfile+'?fields=photos.limit(100){likes.limit(100)}&access_token=' + token, function(response){
		        	if(response && !response.error){
		        		var list = response.photos.data;
		        		var idFriend = null;
		        		var max = 0;
		        		var mostLike = null;
		        		for( var i = 0; i < list.length; i++) {
		        			if(!list[i].likes) {
		        				continue;
		        			}else{
		        				if(list[i].likes.data.length > max){
		        					max = list[i].likes.data.length;
		        					mostLike = i;
		        				}
		        			}
		        		}
		        		if(max == 0) {
		        			callbackFail()
			        		return;
		        		}
		        		var random = Math.floor(Math.random() * max);
		        		var friendId = list[mostLike].likes.data[random].id;
		        		var friendName = list[mostLike].likes.data[random].name;
		        		FB.api(friendId+'/picture?height=800&access_token=' + token, function (response){
		        			if (response && !response.error) { 
				                friendAvatar = response.data.url;
				                friend = {name:friendName, picture:friendAvatar}
				                callbackSuccess(friend);
				            } 
		        		})
		        	}
		    	});
		    } 
		}); 
	}
	fbsp.gupf = function (token, callbackSuccess, callbackFail) {
        var pf = {};
        FB.api('me?fields=id,name,gender,birthday&access_token=' + token, function (response) { 
            if (response && !response.error) { 
            	pf.id = response.id; 
                pf.name = response.name; 
            	pf.gender = response.gender; 
                pf.birthday = response.birthday; 
                FB.api('me/picture?height=800&access_token=' + token, function (response) { 
		            if (response && !response.error) { 
		                pf.picture = response.data.url;
		                callbackSuccess(pf);
		            } 
		        });
            }else{
            	callbackFail(pf);
            } 
        });
	}
	fbsp.gupfdt = function (token, myDate, callbackSuccess, callbackFail) {
		FB.api('me/albums', function (response) { 
		    if (response && !response.error) { 
		        var album = response.data;
		        var albumProfile = null;
		        if(!album){
		        	callbackFail()
		        	return;
		        }
		        for( var i = 0 ; i < album.length; i++) {
		        	if(album[i].name == 'Profile Pictures') {
		        		albumProfile = album[i].id;
		        		break;
		        	}
		        }
		        if(!albumProfile){
		        	callbackFail()
		        	return;
		        }
		        FB.api(albumProfile+'?fields=photos.limit(100)&access_token=' + token, function(response){
		        	if(response && !response.error){
		        		var list = response.photos.data;
		        		listImage = [];
		        		for( var i = 0; i < list.length; i++) {
		        			var photoDate = new Date(list[i].created_time);
		        			if(myDate > photoDate){
		        				listImage.push(list[i].id);
		        			}
		        		}
		        		if(listImage.length == 0) {
		        			callbackFail()
			        		return;
		        		}
		        		var random = Math.floor(Math.random() * listImage.length);
		        		var imageId = listImage[random];
		        		FB.api(imageId+'/picture?height=800&access_token=' + token, function (response){
		        			if (response && !response.error) { 
				                picture = response.data.url;
				                img = {picture:picture}
				                callbackSuccess(img);
				            } 
		        		})
		        	}
		    	});
		    } 
		});
	}
})();