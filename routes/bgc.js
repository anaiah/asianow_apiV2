const express = require('express')
const router = express.Router()

const { connectPg, closePg}  = require('../db')

const zonkedpdf = require('./zonkedpdf')//=== my own module
const Utils = require('./util')//== my func

const IP = require('ip')

const multer = require('multer')

const fetcher = require('node-fetch')

const path = require('path')

const sharp = require('sharp')

const formdata = require('form-data')

const jsftp = require("jsftp")

const fs = require('fs')

const cors = require('cors')

const ftpclient = require('scp2')

const nodemailer = require("nodemailer")

const app = express()

app.use(cors())

//========all about cookies===========
const cookieParser = require('cookie-parser');
app.use(cookieParser())


connectPg()
.then((pg)=>{
    console.log("====BGC.JS ZONKED POSTGRESQL CONNECTION SUCCESS!====")
    closePg(pg);
})                        
.catch((error)=>{
    console.log("***bgc.JS ERROR, CAN'T CONNECT TO POSTGRESQL DB!****",error.code)
});  

//==== save examinee inside dtabase
router.post('/savetodb/', async (req, res) => {	
   
    console.log("Posting.. ", req.body )
	    
	connectPg()
    .then((db)=>{
		 	
		db.query(`INSERT INTO bgc_exam ( full_name, judge_name, remarks, details, group_category,group_category_type, score ) 
			VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING * `,
			[ 	req.body.full_name.toUpperCase(),
				req.body.judge_name.toUpperCase(),
				req.body.remarks,
				JSON.stringify(req.body),
                req.body.exam_type.toUpperCase(),
				req.body.candidate_talent,
				req.body.score
				
			],
			(error,results)=>{
				console.log('inserting examinee..',results.rowCount)
				res.json({
					message: "Candidate Added Successfully!",
					voice:"Candidate Added Successfully!",
					status:true
				})
	
			closePg(db);//CLOSE 	connection
		})
	    
    }).catch((error)=>{
        res.status(500).json({error:'Error'})
    }) 
    
})

//====retrieve all fields for exam
router.get('/getexam/:category', async (req, res) => {	
   
    console.log("getExam()====" )
	    
	connectPg()
    .then((db)=>{
		
		let sql = `select * from bgc_exam_category where group_category = '${req.params.category}' and include = 1 
				order by group_category, exam_category; `

		db.query( sql, (error,results)=>{
				console.log(`getting exam category..${req.params.category}`,results.rowCount)
				res.json({
					data: results.rows,
					status:true
				})
	
			closePg(db);//CLOSE 	connection
		})
	    
    }).catch((error)=>{
        res.status(500).json({error:'Error'})
    }) 
    
})


module.exports = router; //===========export module 