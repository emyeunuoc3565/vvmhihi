module.exports =  function (sequelize, Datatypes) {
    var Title = sequelize.define('Title',{
        id:{
            type:Datatypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        text:{
            type:Datatypes.TEXT,
            allowNull: true
        }
    },{
        freezeTableName: true
    });

    Title.sync();
    return Title
}