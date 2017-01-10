var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var ECT = require('ect');
var app = express();
global.__dirPublic = __dirname + '/Web/public';
global.webConfig = require('./Web/Config/production');
var configDb = global.webConfig.database;
global.db = new Sequelize(configDb.database, configDb.username, configDb.password, configDb);
db['post'] = db.import(__dirname + '/Data/post');
db['user'] = db.import(__dirname + '/Data/user');
db['title'] = db.import(__dirname + '/Data/title');
db['ad'] = db.import(__dirname + '/Data/ad');
db['picture'] = db.import(__dirname + '/Data/picture');
var ectRenderer = ECT({ watch: true, root: __dirname + '/views', ext : '.ect' });
app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);
var admin = require('./Web/Controller/Admin/Admin');
var index = require('./Web/Controller/Index/index');
//Body-parser

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb'}));

var port = process.env.PORT || 3000;
app.use(express.static('Web/public'));
app.use('/admin',admin);
app.use('/',index);
app.listen(port, function(){
	console.log('Server has started at ' + port);
});