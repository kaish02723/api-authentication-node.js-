const mysql2DB=require('mysql2');
const pool=mysql2DB.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'user_auth_api'
});

pool.connect((err)=>{
    if(err){
        console.error('Database connection failed: ',err);
        return;
    }
    console.log('Connected to the database.');
});

module.exports=pool;