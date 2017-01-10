module.exports =  function (sequelize, Datatypes) {
    var Picture = sequelize.define('Picture',{
        id:{
            type:Datatypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        name:{
            type:Datatypes.STRING,
            allowNull:true,
            unique:true
        },
        path:{
            type:Datatypes.TEXT,
            allowNull:true
        }
    },{
        freezeTableName: true
    });

    Picture.sync();
    return Picture
}