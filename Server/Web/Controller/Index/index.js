var express = require('express');
var fs = require('fs');
var controller = express.Router();
controller.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With,   Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    next();
});
controller.get('/', function (req, res) {
    db.post.findAndCountAll({
        where: {
            status:1
        },
        attributes:['id', 'title', 'linkImage', 'link'],
        offset: 0,
        limit: webConfig.index.limitIndex,
        order:'id desc'
    }).then(function(data){
        data.currenPage = 1;
        data.lastPage = Math.ceil(data.count/webConfig.index.limitIndex);
        //load textRun
        db.title.findOne({
            order:'id'
        }).then(function(text){
            var textRun;
            if(text){
                textRun = text.dataValues.text;
            } else{
                textRun = '';
            }
            res.render('index',{post:data, textRun: textRun, seo:'index'})
        })
    }).catch(function(err){
        res.render('err');
        //res.json(err);
    })
})
controller.get('/page/:num', function(req, res){
    try{
        var offset = webConfig.index.limitIndex * parseInt(req.params.num) - webConfig.index.limitIndex;
        db.post.findAndCountAll({
            where: {
                status:1
            },
            attributes:['id', 'title', 'linkImage', 'link'],
            offset: offset,
            limit: webConfig.index.limitIndex,
            order:'id desc'
        }).then(function(data){
            data.currenPage =  parseInt(req.params.num);
            data.lastPage = Math.ceil(data.count/webConfig.index.limitIndex);
            if(data.rows.length == 0) {
                res.render('err');
            }else {
                res.render('index',{post:data, seo:'index'});
                //res.json(data)
            }
        }).catch(function(err){
            res.render('err');
        });
    } catch(err){
        res.json(err);
    }
});
controller.get('/chuithue/:link',getAd, function (req, res) {
    try{
        var resposeData = {};
        resposeData.seo = 'post';
        resposeData.ad = req.ad;
        //load main content
        db.post.findOne({
            attributes:['id', 'title','description', 'linkImage', 'link', 'script', 'createdAt', 'views'],
            where:{
                link: req.params.link
            },
            order:'id desc'
        }).then(function (data){
            if(data){
                // tang view
                db.post.update({
                    views: (parseInt(data.dataValues.views) + 1)
                },{
                    where: {
                        id: data.dataValues.id
                    }
                });

                resposeData.post = data;
                //load list co the ban se thich (hot)
                db.post.findAll({
                    attributes:['id', 'title', 'linkImage', 'link'],
                    where:{
                        priority: webConfig.index.priorityHot
                    },
                    order: [['updatedAt', 'DESC']]
                }).then(function(data){
                    resposeData.hots = data;
                    //load new post
                    db.post.findAndCountAll({
                        where: {
                            status:1
                        },
                        attributes:['id', 'title', 'linkImage', 'link'],
                        offset: 0,
                        limit: webConfig.index.limitIndex,
                        order:'id desc'
                    }).then(function(data){
                        data.currenPage =  1;
                        data.lastPage = Math.ceil(data.count/webConfig.index.limitIndex);
                        if(data.rows.length == 0) {
                            res.render('err');
                        }else {
                            resposeData.news = data;
                            //load textRun
                            db.title.findOne({
                                order:'id'
                            }).then(function(text){
                                var textRun;
                                if(text){
                                    textRun = text.dataValues.text;
                                } else{
                                    textRun = '';
                                }
                                resposeData.textRun = textRun;
                                res.render('post', resposeData);
                            })
                        }
                    }).catch(function(err){
                        res.json(err);
                    })
                }).catch(function(){
                    res.json(data);
                })
            }else{
                res.render('err');
            }
        }).catch(function(err) {
            res.render('err');
        })

    } catch(err) {
        res.json(err);
    }
});
controller.get('/chuithueLoadmore', function(req, res){
    try{
        var offset = webConfig.index.limitIndex * parseInt(req.query.num) - webConfig.index.limitIndex;
        db.post.findAndCountAll({
            where: {
                status:1
            },
            attributes:['id', 'title', 'linkImage', 'link'],
            offset: offset,
            limit: webConfig.index.limitIndex,
            order:'id desc'
        }).then(function(data){
            data.currenPage =  parseInt(req.query.num);
            data.lastPage = Math.ceil(data.count/webConfig.index.limitIndex);
            if(data.rows.length == 0) {
                res.render('err');
            }else {
                res.json(data)
            }
        }).catch(function(err){
            res.render('err');
        });
    } catch(err){
        res.render('err');
    }
});
controller.post('/saveImage', function(req, res) {
    var date = new Date();
    var filename = 'image' + date.getTime().toString() + '.png';
    var file = req.body.file;
    var base64Data = file.replace(/^data:image\/png;base64,/, "");
    require("fs").writeFile(__dirPublic + "/Attachment/" + filename, base64Data, 'base64', function(err) {
        if(!err){
            res.json({linkImage: "/Attachment/" + filename})
        }
        else{
            res.json({err:err});
        }
    });
    //this command to remove file
    function rmDir(dirPath, count) {
        try { var files = fs.readdirSync(dirPath); }
        catch(e) {  return;}
        if (files.length > count){
            var n = files.length - count /2;
            for (var i = 0; i < n ; i++) {
                var filePath = dirPath + '/' + files[i];
                if (fs.statSync(filePath).isFile())
                    fs.unlinkSync(filePath);
                else
                rmDir(filePath, count);
            }
        }
    };
    rmDir(__dirPublic + "/Attachment", 10);
});

controller.get('/privacy-policy', function(req, res){
    res.render('policy', {seo: 'policy'});
})
controller.get('/term-of-service', function(req, res){
    res.render('termService', {seo: 'service'});
})
module.exports = controller;
// lay quang cao
function getAd(req, res, next){
    db.ad.findAndCountAll({
        attributes:['title', 'text'],
        order:'title DESC'
    }).then(function(data){
        if(!data){
            data = {count:0, rows:[]}
        }
        req.ad = data;
        next();
    }).catch(function(err){
        next();
    })
}