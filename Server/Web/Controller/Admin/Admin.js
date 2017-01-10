var express = require('express');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var fileUpload = require('express-fileupload');
var Controller = express.Router();


Controller.all('/', function(req, res) {
    res.sendFile('index.html', {root: webConfig.urlAdminIndex});
});
//authenticate
Controller.post('/api/authenticate', protectRoute, function(req, res){
    res.json({success:true});
});

//login
Controller.post('/api/login', function(req, res){
    db.user.find({
        where: {
            username:req.body.username
        }
    }).then(function (user) {
        if(!user){
            res.json({success:false});
        } else if (user.password != req.body.password) {
            res.json({success:false});
        } else {
            var data = {
                id: user.id,
                username: user.username
            }
            var token = jwt.sign(data, webConfig.keyToken, {
                expiresIn: "2 days"
            });
            res.json({success:true, token: token});
        }
    });
});

//create a post
Controller.post('/api/createPost', protectRoute, function(req, res){
	var newPost = {
        title: req.body.title,
        description: req.body.description,
        linkImage: req.body.linkImage,
        script: req.body.script
    }
    db.post.create(newPost).then(function(){
    	res.json({success:true});
    },function(err){
    	res.json({success:false});
    })
});
Controller.post('/api/getAPost', protectRoute, function(req, res){
    db.post.findOne({
        where:{
            id:req.body.id
        }
    }).then(function(data){
        res.json(data);
    }).catch(function(err){
        res.json(err);
    })
})
// update a post
Controller.post('/api/updatePost', protectRoute, function(req, res){
    if(!req.body){
        res.json({});
        return;
    }
    db.post.update({
        title: req.body.title,
        description: req.body.description,
        linkImage: req.body.linkImage,
        script: req.body.script,
        priority: req.body.priority,
        link: changeLink(req.body.title) + req.body.id
    },{
        where:{
            id:req.body.id
        }
    }).then(function (data) {
        res.json({ success:true });
    }).catch(function (err) {
        res.json({ success:false });
    });
});

// delete a post
Controller.post('/api/deletePost', protectRoute, function(req, res){
    if(!req.body){
        res.json({});
        return;
    }
    db.post.destroy({
        where:{
            id:req.body.id
        }
    }).then(function (data) {
        res.json({
            success:true
        });
    }).catch(function(err) {
        res.json({
            success:false
        });
    });
});
// sua lai priority cho post
Controller.post('/api/priority', protectRoute, function(req, res){
    if(!req.body.id || req.body.priority == undefined){
        res.json({});
        return;
    }
    db.post.update({
        priority: req.body.priority
    },{
        where:{
            id:req.body.id
        }
    }).then(function (data) {
        res.json({ success:true });
    }).catch(function (err) {
        res.json({ success:false });
    });
});
// sua lai active statuc cho post
Controller.post('/api/active', protectRoute, function(req, res){
    if(!req.body.id || req.body.status == undefined){
        res.json({});
        return;
    }
    db.post.update({
        status: req.body.status
    },{
        where:{
            id:req.body.id
        }
    }).then(function (data) {
        res.json({ success:true });
    }).catch(function (err) {
        res.json({ success:false });
    });
});

// search by Title
Controller.post('/api/search', protectRoute, function(req, res){
    db.post.findAll({
        attributes:['id', 'title','description', 'linkImage', 'link','status','priority', 'views', 'createdAt', 'updatedAt'],
        where: {
            title: {
                $iLike: '%' + req.body.title + '%'
            }
        },
        order:'id desc'
    }).then(function(data){
        db.title.findOne({
            order:'id'
        }).then(function(title){
            res.json({rows:data, title:title});
        });
    }).catch(function(err){})
});
//change password
Controller.post('/api/changePassword', protectRoute, function(req, res){
    db.user.findOne({
        where: {
            username: req.body.username,
            password: req.body.oldPassword
        }
    }).then(function(data){
        if (!data) {
            res.json({success:false});
        }else{
            db.user.update({
                password: req.body.newPassword
            },{
                where:{
                    username: req.body.username,
                    password: req.body.oldPassword
                }
            }).then(function (data) {
                res.json({ success:true });
            }).catch(function (err) {});
        }
    }).catch(function(err){})
});
//save runText
Controller.post('/api/saveRunText', protectRoute, function(req, res){
    db.title.update({
        text: req.body.text
    },{
        where:{
            id: req.body.id
        }
    }).then(function(data){
        res.json({success: true})
    }).catch(function(err){});
})
//get Ad
Controller.post('/api/getAd', protectRoute, function(req, res){
    db.ad.findAll({
        order:'id DESC'
    }).then(function(data){
        res.json(data);
    }).catch(function(err){
        res.json(err);
    })
})
//create Ad
Controller.post('/api/createAd', protectRoute, function(req, res){
    db.ad.create({
        title: req.body.title,
        text: req.body.text
    }).then(function(data){
        res.json({success: true});
    }).catch(function(err){
        res.json(err);
    });
})
//update Ad
Controller.post('/api/updateAd', protectRoute, function(req, res){
    db.ad.update({
        title: req.body.title,
        text: req.body.text
    },{
        where:{
            id: req.body.id
        }
    }).then(function(data){
        res.json({success: true})
    }).catch(function(err){
        res.json(err);
    })
})
//delete Ad
Controller.post('/api/deleteAd', protectRoute, function(req, res){
    db.ad.destroy({
        where: {
            id: req.body.id
        }
    }).then(function(data){
        res.json({success: true})
    }).catch(function(err){
        res.json(err);
    })
})


// exportData
Controller.post('/api/exportData', protectRoute, function(req, res){
     db.post.findAll({
        order:'id desc'
    }).then(function(data){
        res.json(data);
    }).catch(function(err){
        res.json(err);
    })
})

//Picture library upload
Controller.post('/api/uploadPicture',protectRoute, fileUpload(), function(req, res){
    var file;
    if(!req.files){
        res.json({success: false, message:'no file upload'});
        return;
    }
    file = req.files.picture;
    db.picture.create({
        name: file.name,
        path: 'PictureLibrary/' + file.name
    }).then(function(data){
        file.mv(__dirPublic + '/PictureLibrary/' + file.name, function(err){
            if(err){
                res.json({success: false, message:err})
            }else{
                res.json({success: true});
            }
        });
    }).catch(function(err){
        res.json({success:false, message:'file da ton tai'})
    })
    
});
//Picture get data picture
Controller.post('/api/getPicture',protectRoute, function(req, res){
    db.picture.findAndCountAll({
        limit: req.body.limit,
        offset: req.body.offset,
        order: 'id DESC'
    }).then(function(data){
        res.json(data);
    }).catch(function(err){
        res.json(err);
    });
})
//Picture delete a picture
Controller.post('/api/deletePicture',protectRoute, function(req, res){
    db.picture.findOne({where:{ id: req.body.id}}).then(function(picture){
        if(!picture){
            res.json({success:false});
            return;
        }
        try{ 
            var filePath = __dirPublic + '/' + picture.path;
            if (fs.statSync(filePath).isFile()){
                fs.unlinkSync(filePath);
            }
            db.picture.destroy({where:{id:req.body.id}}).then(function(data){
                res.json({success: true});
            })
        }catch(err){
            res.json({err})
        }
                    
    })
})
module.exports = Controller;
function changeLink(str) {
        str = str.toLowerCase()
        str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
        str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
        str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");
        str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ  |ợ|ở|ỡ/g,"o");
        str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
        str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
        str= str.replace(/đ/g,"d");
        str = str.split(/[^a-z0-9]+/).join('-');
        return str;
    }
function protectRoute(req, res, next){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token) {
        jwt.verify(token, webConfig.keyToken, function (err, decoded) {
            // invalid token 
            if(err) {
                res.json({
                    success: false,
                    message: 'invalidToken',
                    status: 404  
                });
            } else {
            // valid token
                next();
                return;
            }
        });
    } else{
        // no token provided
        res.json({
            success: false,
            message: 'noToken',
            status: 404  
        });
    }
}