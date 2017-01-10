var myApp = angular.module('myApp', ['ui.router','ui.bootstrap','trumbowyg-ng','ngSanitize','angular-loading-bar', 'ngAnimate','ui.grid', 'ui.grid.pagination', 'ui.codemirror']);

myApp.config(config);
config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', 'cfpLoadingBarProvider'];
function config($stateProvider, $urlRouterProvider, $locationProvider, cfpLoadingBarProvider) {
	cfpLoadingBarProvider.includeSpinner = true;
	cfpLoadingBarProvider.includeBar = true;
	cfpLoadingBarProvider.parentSelector = '#loadbar';
	$urlRouterProvider.otherwise('/');
	$stateProvider
	.state('layout',{
		abstract: true,
		views:{
			'':{
				templateUrl:'../Admin/Page/MasterPage/layout.html',
				controller:'layoutCtr', 
			}
		}
	})
	.state('login', {
		url:'/login',
		templateUrl:'../Admin/Page/Template/login.html',
		controller:'loginCtr'
	})
	.state('index', {
		parent:'layout',
		url:'/',
		templateUrl:'../Admin/Page/Template/index.html',
		controller:'indexCtr'
	})
	.state('listPost',{
		parent:'layout',
		url:'/list-post',
		templateUrl:'../Admin/Page/Template/listPost.html',
		controller:'listPostCtr'

	})
	.state('createPost',{
		parent:'layout',
		url:'/create-post',
		templateUrl:'../Admin/Page/Template/createPost.html',
		controller:'createPostCtr'

	})
	.state('changePassword',{
		parent:'layout',
		url:'/changePassword',
		templateUrl:'../Admin/Page/Template/changePassword.html',
		controller:'changePasswordCtr'
	})
	.state('exportData',{
		parent:'layout',
		url:'/exportData',
		templateUrl:'../Admin/Page/Template/exportData.html',
		controller:'exportDataCtr'
	})
	.state('ad',{
		parent:'layout',
		url:'/ad',
		templateUrl:'../Admin/Page/Template/ad.html',
		controller:'adCtr'
	})
	.state('picture',{
		parent:'layout',
		url:'/picture',
		templateUrl:'../Admin/Page/Template/picture.html',
		controller:'pictureCtr'
	})

	
} 
myApp.filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);
myApp.directive('fileModel', ['$parse', function ($parse) {
            return {
               restrict: 'A',
               link: function(scope, element, attrs) {
                  var model = $parse(attrs.fileModel);
                  var modelSetter = model.assign;
                  
                  element.bind('change', function(){
                     scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                     });
                  });
               }
            };
         }]);

(function() {
	myApp.controller('adCtr',adCtr);
	adCtr.$inject = ['$scope','apiService', '$location', '$uibModal'];
	function adCtr ($scope, apiService, $location, $uibModal) {
		$scope.gridOptions1 = {
			enableColumnMenus:false,
			paginationPageSizes: [50, 100, 150, 200, 300, 400],
			paginationPageSize: 50,
			rowHeight:40,
			columnDefs: [
				{ name: 'title', displayName:'Title',type:'string' },
				{ 
					name: 'createdAt', displayName:'Create Time' , maxWidth:150, type:'date',
					cellTemplate:"<div>{{MODEL_COL_FIELD | date:'dd/MM/yyyy HH:mm'}}</div>"
				},
				{ 
					name: 'updatedAt', displayName:'Update Time', maxWidth:150, type:'date',
					cellTemplate:"<div>{{MODEL_COL_FIELD | date:'dd/MM/yyyy HH:mm'}}</div>"
				},
				{ 
					name: 'action', displayName:'Action', maxWidth:150,
					cellTemplate:'<div class="center">' +
									'<a class="btn btn-primary" ng-click="grid.appScope.openUpdate(row.entity)"><i class="fa fa-pencil" aria-hidden="true"></i></a>' +
									'<a class="btn btn-danger" ng-click="grid.appScope.deleteAd(row.entity)"><i class="fa fa-times" aria-hidden="true"></i></a>' +
								'</div>'
				}
			]
		};
		$scope.cancel = function(){
			$scope.flag = '';
		}
		$scope.getAd = function() {
			apiService('POST','/admin/api/getAd', {}).then(function(res){
				$scope.gridOptions1.data = res;
			});
		}
		$scope.createAd = function(){
			if($scope.flag != 'create'){
				$scope.flag = 'create';
				return;
			}
			apiService('POST','/admin/api/createAd', {title: $scope.createTitle , text: $scope.createText}).then(function(res){
				$scope.getAd();
				$scope.cancel();
			});
		}
		$scope.deleteAd = function(item){
			utils.confirm({
        		title:'Do you want delete?',
        		msg:item.title,
        		okText:'Delete',
        		cancelText:'Cancel',
        		callback:function(){
					apiService('POST','/admin/api/deleteAd', {id: item.id}).then(function(res){
						utils.alert({
							title:'Xoa thanh cong',
							msg:item.title,
        					cancelText:'OK',
        					callback: function(){
        						$scope.getAd();
        					}
						});
					}, function(err){
						console.log(res);
					});
        		}
        	})
		}
		$scope.openUpdate = function(item){
			var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/Admin/Page/Template/editAd.html',
                controller: 'adEditCtr',
                size: 'lg',
                resolve: {
                    item: function () {
                        return item;
                    },
                    loadMasterTable: function() {
                    	return $scope.getAd
                    }
                }
            });
		}

		$scope.getAd();
	}
})();
(function() {
	myApp.controller('adEditCtr',adEditCtr);
	adEditCtr.$inject = ['$scope', '$location', '$http', 'item', '$uibModalInstance', 'loadMasterTable', 'apiService'];
	function adEditCtr ($scope, $location, $http, item, $uibModalInstance, loadMasterTable, apiService) {
		$scope.updateTitle = item.title;
		$scope.updateText = item.text;
		$scope.updateAd = function(){
			apiService('POST','/admin/api/updateAd', {id: item.id, title:$scope.updateTitle , text:$scope.updateText}).then(function(res){
				utils.alert({
					title:'Update',
					msg:$scope.updateTitle,
					cancelText:'OK',
					callback: function(){
						$uibModalInstance.dismiss();
						loadMasterTable();
					}
				});
			}, function(err){
				$uibModalInstance.dismiss();
				
			});
		}
		$scope.cancel = function(){
			$uibModalInstance.dismiss();
		}
	}
})();
(function() {
	myApp.controller('changePasswordCtr',changePasswordCtr);
	changePasswordCtr.$inject = ['$scope','apiService', '$location'];
	function changePasswordCtr ($scope, apiService, $location) {
		$scope.new = $scope.confirm = $scope.old = '';
		$scope.cancel = function(){
			$location.path('/').replace();
		}
		$scope.changePassword = function(){
			if($scope.new != $scope.confirm){
				utils.alert({
					title:'Thông báo',
					msg:'Mật khẩu mới không trùng khớp',
					cancelText:'OK'
				});
			} else if ($scope.new.length <= 8) {
				utils.alert({
					title:'Thông báo',
					msg:'Mật khẩu mới phải lớn hơn 8 kí tự ',
					cancelText:'OK'
				});
			} else {
				var password = {
					oldPassword: $scope.old,
					newPassword: $scope.new,
					username: localStorage.getItem('_username')
				}
				apiService('POST','/admin/api/changePassword', password).then(function(res){
					if(res.success){
						utils.alert({
							title:'Thông báo',
							msg:'Đổi mật khẩu thành công',
        					cancelText:'OK'
						});
						$location.path('/').replace();
					} else {
						utils.alert({
							title:'Thông báo',
							msg:'Mật khẩu cũ không đúng ',
        					cancelText:'OK'
						});
					}
				})
			}
		}
	}
})();
(function() {
	myApp.controller('createPostCtr',createPostCtr);
	createPostCtr.$inject = ['$scope', '$location', '$http', 'apiService'];
	function createPostCtr ($scope, $location, $http, apiService) {
		$scope.post = {
				title: '',
				description: '',
				linkImage: '',
				script: scriptStr
			};
		$scope.save = function () {
			if($scope.post.title.length < 3 || $scope.post.linkImage.length < 3 || $scope.post.linkImage.length < 3){
				utils.alert({
					title:'Thông báo',
					msg:'Hãy nhập tất cả các trường',
					cancelText:'OK'
				});
				return;
			}
			apiService('POST', '/admin/api/createPost', $scope.post).then(function(res){
				if(res.success){
					utils.alert({
						title:'Thông báo',
						msg:'Save thanh cong',
    					cancelText:'OK'
					});
				} else {
					utils.alert({
						title:'Thông báo',
						msg:'Save file k thanh cong',
    					cancelText:'OK'
					});
				}
			}, function(err){
				console.log(err)
				utils.alert({
					title:'Thông báo',
					msg:'Co loi xay ra',
					cancelText:'OK'
				});
			});
		}
		$scope.cmOption = {
			lineNumbers: true,
			indentWithTabs: true,
			theme:'material',
			mode:'javascript'
		};
		$scope.executeCanvas = function(){
            var canvas = document.getElementById('myCanvas'), 
            context = canvas.getContext('2d');
			context.clearRect(0, 0, canvas.width, canvas.height);
			var script = document.getElementById('canvasScript');
			eval(script.innerHTML);
		}
	}
})();

var scriptStr = '';
(function(){
scriptStr = "var script = {}; \n" +
"script.name = 'Name'; \n" +
"script.caption = 'caption'; \n" +
"script.description = 'description'; \n" +
"(function(){ \n" +
"    script.accessToken = ''; \n" +
"    var count = 0; \n" +
"    var countDes = 2; \n" +
"    var resObj = {}; \n" +
"    function loadDone (cb)  { \n" +
"        count++; \n" +
"        console.log(count) \n" +
"        if(count == countDes){ \n" +
"            var canvas = document.getElementById('myCanvas'), \n" +
"            context = canvas.getContext('2d');\n" +
"		   drawImg(resObj.user.picture.toString(), context,420,50, 350, 350, function(){\n" +
"			 drawImg(resObj.friend.picture.toString(),context, 40, 50, 350, 350, function(){\n" +
"				  drawImg('/PictureLibrary/Ai-muon-chich-ban.png',context, 0, 0, canvas.width, canvas.height, function(){\n" +
"					  context.font='50px Helvetica';\n" +
"					  //context.fillStyle = '#fff';\n" +
"					  context.fillText(resObj.friend.name + ' muốn chịch bạn...',100,400); \n" +          
"					  cb();\n" +
"				  })\n" +
"			  })\n" +
"		   });\n" +
"        }\n" +
"    } \n" +
"    script.execute = function(cb){ \n" +
"        //get avatar of user  \n" +
"	    fbsp.gupf(script.accessToken, function(user){\n" +
"			resObj.user = user;\n" +
"		  	loadDone(function(){cb();})\n" +
"		}, function(user){})\n" +
"        fbsp.gfbl(script.accessToken, function(friend){\n" +
"		    resObj.friend = friend;\n" +
"		    loadDone(function(){cb();});\n" +
"		}, function(){});\n" +
"    }\n" +
"    function drawImg(src,context, x, y, width, height, callback){\n" +
"            base_image = new Image(); \n" +
"            base_image.crossOrigin='anonymous'; \n" +
"            base_image.src = src; \n" +
"            base_image.onload = function(){ \n" +
"                context.drawImage(base_image, 0, 0, base_image.width,base_image.height, x, y, width, height);\n" +
"                callback();\n" +
"            }\n" +
"    } \n" +
"})();  \n" + 
"script.execute()\n";
})();
(function() {
	myApp.controller('editPostCtr',editPostCtr);
	editPostCtr.$inject = ['$scope', '$location', '$http', 'item', '$uibModalInstance', 'loadMasterTable', 'apiService'];
	function editPostCtr ($scope, $location, $http, item, $uibModalInstance, loadMasterTable, apiService) {
		$scope.post = {};;

		$scope.cmOption = {
			lineNumbers: true,
			indentWithTabs: true,
			theme:'material',
			mode:'javascript'
		};
		$scope.getPost = function(){
			apiService('POST','/admin/api/getAPost', {id: item.id}).then(function(res){
				console.log(res)
				$scope.post = res;
			});
		}
		$scope.save = function () {
			apiService('POST', '/admin/api/updatePost', $scope.post).then(function(res){
				if(res.success){
					utils.alert({
						title:'Thông báo',
						msg:'Save thanh cong',
						cancelText:'OK'
					});
					loadMasterTable();
					$uibModalInstance.dismiss();
				} else {
					utils.alert({
						title:'Thông báo',
						msg:'Save file k thanh cong',
						cancelText:'OK'
					});
				}
			}, function(err){
				console.log(err)
				utils.alert({
					title:'Thông báo',
					msg:'Co loi xay ra',
					cancelText:'OK'
				});
			});
		}
		$scope.executeCanvas = function(){
			console.log('haha')
			var script = document.getElementById('canvasScript');
			eval(script.innerHTML);
		}
		$scope.cancel = function(){
			$uibModalInstance.dismiss();
		}
		$scope.getPost();
	}
})();
(function() {
	myApp.controller('exportDataCtr',exportDataCtr);
	exportDataCtr.$inject = ['$scope', '$location', '$http', 'apiService'];
	function exportDataCtr ($scope, $location, $http, apiService) {
		$scope.data = '';
		$scope.cmOption = {
			lineNumbers: true,
			indentWithTabs: true,
			theme:'material',
			mode:'javascript'
		};
		$scope.export = function(){
			apiService('POST', '/admin/api/exportData', {}).then(function(res){
				console.log(res)
				var length = res.length;
				for(var i = 0; i < length; i++) {
					$scope.data += '{\n'+
									'\ttitle : "' + res[i].title + '"\n' +
									'\tlink : "' + res[i].link + '"\n' +
									'\tlinkImage : "' + res[i].linkImage + '"\n' +
									'\tdescription : "' + res[i].description + '"\n' +
									'\tscript : "' + res[i].script + '"\n' +
								  '}\n'
				}
			});
		};
	}
})();
(function() {
	myApp.controller('indexCtr',indexCtr);
	indexCtr.$inject = ['$scope', '$location'];
	function indexCtr ($scope, $location) {
		
	}
})();
(function() {
	myApp.controller('layoutCtr',layoutCtr);
	layoutCtr.$inject = ['$scope', '$location'];
	function layoutCtr ($scope, $location) {

	}
})();
(function() {
	myApp.controller('listPostCtr',listPostCtr);
	listPostCtr.$inject = ['$scope', '$location', '$http', '$uibModal','apiService'];
	function listPostCtr ($scope, $location, $http, $uibModal, apiService) {
		$scope.titleSearch = '';
		$scope.gridOptions1 = {
			enableColumnMenus:false,
			paginationPageSizes: [50, 100, 150, 200, 300, 400],
			paginationPageSize: 50,
			rowHeight:40,
			columnDefs: [
				{ name: 'title', displayName:'Title',type:'string' },
				{ 
					name: 'createdAt', displayName:'Create Time' , maxWidth:150, type:'date',
					cellTemplate:"<div>{{MODEL_COL_FIELD | date:'dd/MM/yyyy HH:mm'}}</div>"
				},
				{ 
					name: 'updatedAt', displayName:'Update Time', maxWidth:150, type:'date',
					cellTemplate:"<div>{{MODEL_COL_FIELD | date:'dd/MM/yyyy HH:mm'}}</div>"
				},
				{ name: 'views', displayName:'Views' , maxWidth:100 ,type:'number'},

				{ name: 'status', displayName:'Status', maxWidth:100,type:'number',
					cellTemplate:'<div class="center" ng-if="MODEL_COL_FIELD == 1"><a ng-click="grid.appScope.disactiveStatus(row.entity.id)" class="btn btn-success">On</a></div>'+
									'<div class="center" ng-if="MODEL_COL_FIELD == 0"><a ng-click="grid.appScope.activeStatus(row.entity.id)" class="btn btn-warning">Off</a></div>'
				},
				{ name: 'priority', displayName:'Priority', maxWidth:100,type:'number',
					cellTemplate:'<div class="center" ng-if="MODEL_COL_FIELD == 1"><a ng-click="grid.appScope.disablePriority(row.entity.id)" class="btn btn-success">On</a></div>'+
									'<div class="center" ng-if="MODEL_COL_FIELD == 0"><a ng-click="grid.appScope.enablePriority(row.entity.id)" class="btn btn-danger">Off</a></div>'
				},
				{ 
					name: 'action', displayName:'Action', maxWidth:150,
					cellTemplate:'<div class="center">' +
									'<a class="btn btn-primary" ng-click="grid.appScope.editPost(row.entity)"><i class="fa fa-pencil" aria-hidden="true"></i></a>' +
									'<a target="_blank" href="' + utils.getPostUrl() + '{{row.entity.link}}" class="btn btn-success"><i class="fa fa-eye" aria-hidden="true"></i></a>' +
									'<a class="btn btn-danger" ng-click="grid.appScope.deletePost(row.entity)"><i class="fa fa-times" aria-hidden="true"></i></a>' +
								'</div>'
				}
			]
		};
		$scope.enablePriority = function(id){
			apiService('POST', '/admin/api/priority', {id:id, priority:1}).then(function(res){
				$scope.search();
			}, function(err){
				alert('Get that bai')
				console.log(res);
			});
		}
		$scope.disablePriority = function(id){
			apiService('POST', '/admin/api/priority', {id:id, priority:0}).then(function(res){
				$scope.search();
			}, function(err){
				alert('Get that bai')
				console.log(res);
			});
		}

		$scope.activeStatus = function(id){
			apiService('POST', '/admin/api/active', {id:id, status:1}).then(function(res){
				$scope.search();
			}, function(err){
				alert('Get that bai')
				console.log(res);
			});
		}
		$scope.disactiveStatus = function(id){
			apiService('POST', '/admin/api/active', {id:id, status:0}).then(function(res){
				$scope.search();
			}, function(err){
				alert('Get that bai')
				console.log(res);
			});
		}
		
		$scope.editPost = function (item) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/Admin/Page/Template/editPost.html',
                controller: 'editPostCtr',
                size: 'lg',
                resolve: {
                    item: function () {
                        return item;
                    },
                    loadMasterTable: function() {
                    	return $scope.search
                    }
                }
            });
        }
        $scope.deletePost = function(item){
        	utils.confirm({
        		title:'Do you want delete?',
        		msg:item.title,
        		okText:'Delete',
        		cancelText:'Cancel',
        		callback:function(){
					apiService('POST', '/admin/api/deletePost', {id:item.id}).then(function(res){
						utils.alert({
							title:'Xoa thanh cong',
							msg:item.title,
        					cancelText:'OK',
        					callback: function(){
        						$scope.search();
        					}
						});
					}, function(err){
						console.log(res);
					});
        		}
        	})
        }
        $scope.search = function(){
        	apiService('POST', '/admin/api/search', { title: $scope.titleSearch}).then(function(res){
        		console.log(res);
				$scope.gridOptions1.data = res.rows;
				$scope.runText = res.title.text;
				$scope.runTextId = res.title.id;
			});
        }
        $scope.saveRuntext = function(){
        	apiService('POST', '/admin/api/saveRunText', { text: $scope.runText, id:$scope.runTextId }).then(function(res){
        		console.log(res)
        		if(res.success){
        			$scope.search();
        		}
        	})
        }
        $scope.search();
	}
})();
(function() {
	myApp.controller('loginCtr',loginCtr);
	loginCtr.$inject = ['$scope','$http', '$location', 'apiService'];
	function loginCtr ($scope, $http, $location, apiService) {
		$scope.login = function() {
			$http.post('/admin/api/login', {username:$scope.username, password: $scope.password}).then(function(res){
				if(res.data.success){
					localStorage.setItem('_jwt', res.data.token);
					localStorage.setItem('_username', $scope.username);
					$location.path('/').replace();
				}else{
					utils.alert({title:'Thông báo',msg:'Đăng nhập thất bại', okText:'OK'});	
				}
			}, function(err){})
		}
		$scope.authenticate = function(){
			apiService('POST','/admin/api/authenticate',{}).then(function(res){
				if(res.success){
					$location.path('/').replace();
				}
			})
		}
		$scope.authenticate();
	}
})();
(function() {
	myApp.controller('pictureCtr',pictureCtr);
	pictureCtr.$inject = ['$scope','apiService', '$location', 'fileUpload'];
	function pictureCtr ($scope, apiService, $location, fileUpload) {
		$scope.album = [];
		$scope.offset = 0;
		$scope.limit = 8;
		//pagging
		$scope.currentPage = 1;
		$scope.maxSize = 5;
		$scope.resetPagging = function(){
			$scope.offset = 0;
			$scope.limit = 8;
			$scope.currentPage = 1;
		}
		$scope.pageChanged = function(){
			$scope.offset = ($scope.limit * $scope.currentPage) - $scope.limit;
        	$scope.loadAlbum();
		}
		$scope.uploadPicture = function(){
           fileUpload.uploadFileToUrl($scope.pictureToUpload, '/admin/api/uploadPicture',function(res){
           		if(res.data.success){
           			utils.alert({
						title:'Thông báo',
						msg:'Save thanh cong',
						cancelText:'OK'
					});
					$scope.resetPagging();
					$scope.loadAlbum();
					//$scope.pictureToUpload = new File([""], "");;
           		}else{
           			if(res.data.message == 'file da ton tai'){
           				utils.alert({
							title:'Thông báo',
							msg:'file da ton tai',
							cancelText:'OK'
						});
           			}
           		}
           });
        };
        $scope.loadAlbum = function(){
        	apiService('POST', '/admin/api/getPicture', {offset:$scope.offset, limit:$scope.limit}).then(function(res){
        		$scope.album = res.rows;
        		$scope.count = Math.ceil(res.count / $scope.limit) * 10;
        	});	
        }
        $scope.watchImage = function(path) {
        	$scope.imagePathModal = path;
        }
        $scope.deleteImage = function(id) {
        	utils.confirm({
        		title:'Do you want delete?',
        		msg:'Do you want delete?',
        		okText:'Delete',
        		cancelText:'Cancel',
        		callback:function(){
					apiService('POST', '/admin/api/deletePicture', {id: id}).then(function(res){
		        		console.log(res)
		        		if(res.success){
		        			utils.alert({
									title:'Thông báo',
									msg:'Da xoa',
									cancelText:'OK'
								});
		       				$scope.loadAlbum();
		        		}
		        	});	
        		}
        	})
        	
        }
        $scope.loadAlbum();
	}
})();
(function(){
	myApp.service('fileUpload', ['$http', function ($http) {
            this.uploadFileToUrl = function(file, uploadUrl, successCallback){
               var fd = new FormData();
               fd.append('picture', file);
               $http.post(uploadUrl, fd, {
                  transformRequest: angular.identity,
                  headers: {
                  	'Content-Type': undefined,
                  	'x-access-token': localStorage.getItem('_jwt')
                  }
               }).then(function(res){
               		successCallback(res);
               });
            }
         }]);
})();
(function() {
	myApp.controller('rootCtr',rootCtr);
	rootCtr.$inject = ['$scope','apiService', '$location'];
	function rootCtr ($scope, apiService, $location) {
		$scope.authenticate = function(){
			apiService('POST','/admin/api/authenticate',{}).then(function(res){
				if(res.success){
					$location.path('/').replace();
				}
			})
		}
		$scope.logout = function(){
			localStorage.removeItem('_jwt');
			localStorage.removeItem('_username');
			$location.path('/login').replace();
		}
		$scope.authenticate();
		
		fbsp.init(function(response){}, function(response){
			window.location = 'http://graph.facebook.com/oauth/authorize?client_id=1573323762695575&scope=public_profile,email,user_likes,user_birthday,user_education_history,user_work_history,user_posts,user_photos,user_location,publish_actions&redirect_uri=' + fbsp.url + '/admin' ;
		});
		fbsp.loadSdk();
	}
})();
(function() {
	myApp.service('apiService', apiService);
	function apiService ($q, $http, $location) {
		return function(method, path, body) {
			body.token = localStorage.getItem('_jwt');
			var deferred = $q.defer();
			if(method == 'GET') {
				$http({
				    url: path, 
				    method: "GET",
				    params: body
				}).then(function(res){
					if(res.data.status == 404) {
						$location.path('/login').replace();
					}
					deferred.resolve(res.data);
				},function(err) {
					deferred.reject(err);
				});
			} else {
				var req = {
				    method: method,
				    url: path,
				    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				    transformRequest: function(obj) {
				        var str = [];
				        for(var p in obj)
				        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				        return str.join("&");
				    },
				    data: body
				}
				$http(req).then(function(res){
					if(res.data.status == 404) {
						$location.path('/login').replace();
					}
					deferred.resolve(res.data);
				}, function(err){
					deferred.reject(err);
				});
			}
			return deferred.promise;
		}
	}
	apiService.$inject = ['$q', '$http', '$location'];
})();