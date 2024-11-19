const mysql = require('mysql2');
const {Client} = require('pg');

 
//const uri = process.env.DB_URL+process.env.DB_NAME

module.exports={
    connectDb :()=>{
        return new Promise((resolve,reject)=>{
            const con = mysql.createConnection( {
                host: process.env.DB_HOST_LOCAL||localhost,
                user: process.env.DB_UID_LOCAL||myUserName ,
                password: process.env.DB_PWD_LOCAL||mypassword,
                database: process.env.DB_NAME_LOCAL||mydb,
                multipleStatements: true
            });
            con.connect((err) => {
                if(err){
                    reject(err);
                }
                    resolve(con);
            });
        
        })//END RETURN
    },
    closeDb : (con)=> {
        con.destroy();
    },

    connectPg :()=>{
        return new Promise((resolve,reject)=>{
            const dbconfig ={
                //host:"dpg-cnjiar2cn0vc73c211h0-a.singapore-postgres.render.com",
                //host:"postgresql://osndproot03052k24:Sa2tCwB3apVozuuzqcQiyF2xFqILFqgX@dpg-cnjiar2cn0vc73c211h0-a.singapore-postgres.render.com:5432/osndp?ssl=true",
                //user:"osndproot03052k24",
                //password:"Sa2tCwB3apVozuuzqcQiyF2xFqILFqgX",
                //database:"osndp",
                //render.com
                host: "dpg-cqa9lciju9rs73bfl3u0-a.singapore-postgres.render.com",
                user:"zonked_thesisgrp",
                password:"3oHb9CTV1WqT91u1XJPOXeNnLEEVFR85",
                database:"zonked",
                /*host: "ep-silent-frost-a1pbzz8b.ap-southeast-1.aws.neon.tech",
                user:"ovudb_owner",
                password:"HSG4DVR5ZsLP",
                database:"zonked",*/
                port:5432,
                ssl: true,
                min: 4,
                max: 10,
                idleTimeoutMillis: 1000, 
                multipleStatements:true
            }
            
            const client = new Client(dbconfig);
            client.connect((err) => {
                if(err){
                    reject(err);
                }
                    resolve(client);
            });
        
           
        })//END RETURN
    },
    closePg: (client)=> {
        client.end();
    },
}//END EXPORT

