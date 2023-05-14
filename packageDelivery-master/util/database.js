// connecting db using sequelize

// const Sequelize = require("sequelize");

// const sequelize  = new Sequelize('users','localhost','saini168',{
//     dialect :'mysql'
// });

// module.exports = sequelize;

// console.log(sequelize);

const mysql = require('mysql2');

const pool = mysql.createPool({
    host :'localhost',
    user : 'root',
    password : 'saini168',
    database : 'users'
})

module.exports = pool.promise();