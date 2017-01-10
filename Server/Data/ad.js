module.exports =  function (sequelize, Datatypes) {
    var Ad = sequelize.define('Ad',{
        id:{
            type:Datatypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        title:{
            type:Datatypes.STRING,
            allowNull:true,
        },
        text:{
            type:Datatypes.TEXT,
            allowNull:true,
        }
    },{
        freezeTableName: true
    });

    Ad.sync();
    return Ad
}