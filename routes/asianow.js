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




//====== GET DELIVERIES ========//
router.get('/getdelivery/:riderid/:branch',async(req,res)=>{
    connectPg()
    .then((db)=>{
		 	
        switch(req.params.branch){
			case "_sj":
				br = " asiaone_warehouse_sj " 
				break;
			case "_mkti":
				br = " asiaone_warehouse_mkti "
				break;
		}

        let sql = `select * from ${br} 
         WHERE rider_id = ${req.params.riderid} and status = 0 ;`

         console.log(sql)

        db.query(`${sql}`, (err,data) => {
            console.log( 'writesched()',data.rowCount)

            if ( data.rowCount == 0) {   //data = array 
                
                closePg(db);//CLOSE connection
                res.status(500).json({ status : false, voice:'Error!', message:'Error!' })			
            }else{

                let xtable = 
				`
					<table class="table"> 
					<thead>
						<tr>
						<th colspan=2>Delivery List</th>
						</tr>
					</thead>
					<tbody>`

					for(let zkey in data.rows){

						xtable+= `<tr>
						<td><i class="fa fa-ambulance"></i> <b>Parcel No.</b></td>
						<td><b>${data.rows[zkey].package_no}</b></td>
						<tr>
						<td><i class="fa fa-user-md"></i> Client</td>
						<td> ${data.rows[zkey].client_name}</td>
						</tr>
						<tr>
						<td><i class="fa fa-medkit"></i> Amount</td>
						<td style="white-space:normal !important;word-wrap:break-word;min-width:160px;max-width:160px;">
						${data.rows[zkey].amount}</td>
						</tr>
						<tr>
						<td colspan=2>
												
						<div class='btn-group-vertical' role='group'>
						
						<button type='button'  id='tag-btn-${zkey}' class='btn btn-success' 
							onclick='javascript:zonked.tagDelivery("${data.rows[zkey].id}","${br}")'>
							<i class="fa fa-truck"></i>&nbsp;Tag Delivered 
						</button>
						</div>
						</td>
						</tr>
						`

					}
				/*
				taken out 10/28/2k24
						<button type='button' id='gcash-btn-${zkey}' class='btn btn-primary' 
							onclick='javascript:zonked.paygcash("${data.rows[zkey].case_no}","${data.rows[zkey].patient_name}","${zkey}")'>
							<i class="fa fa-money"></i>&nbsp;Pay GCASH
						</button>
				*/				
				
				xtable+=	
					`</tbody>
					</table>
					`

                res.status(200).send(xtable)			
            }//eif
            closePg( db )
        }) //end db.query 
	    
    }).catch((error)=>{
        res.status(500).json({error:'Error'})

    })    
})

//===tag delivered
//===========decline patient 
router.get('/tagdelivery/:packageid/:branch', async(req,res)=>{
	console.log('000','tagdeliverrry()')

    switch(req.params.branch){
        case "_sj":
            br = " asiaone_warehouse_sj " 
            break;
        case "_mkti":
            br = " asiaone_warehouse_mkti "
            break;
    }

	connectPg()
    .then((db)=>{
		let sql = `UPDATE ${br}
				SET status = 1 
		 		WHERE id = ${req.params.packageid} ;`
		console.log(sql)

		db.query(sql , (err,data) => {
			console.log( 'update status record to closed',data.rowCount)
		
			if ( data.rowCount == 0) {   //data = array 
				//onsole.log('no rec')
				
				//console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")
				res.status(500).json({ status : false, voice:'Error', message:'Error' })
			}else{

				res.status(200).json({ status : true, voice:'Delivered Successfully', message:'Delivered Successfully' })			
			}//eif

			closePg( db )
		}) //end db.query 
	})//tne .then(db)
})



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