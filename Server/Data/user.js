module.exports =  function (sequelize, Datatypes) {
    var User = sequelize.define('User',{
        id:{
            type:Datatypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        username:{
            type:Datatypes.STRING,
            allowNull:false,
            unique:true
        },
        password:{
            type:Datatypes.STRING,
            allowNull:false
        }
    },{
        freezeTableName: true
    });

    User.sync();
    return User
}