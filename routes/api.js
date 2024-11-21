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
    console.log("====API.JS ZONKED POSTGRESQL CONNECTION SUCCESS!====")
    closePg(pg);
})                        
.catch((error)=>{
    console.log("***API.JS ERROR, CAN'T CONNECT TO POSTGRESQL DB!****",error.code)
});  

//===================================================== FUNCTIONS =========================================//
const adyenpay = () => {

const keyko = "AQEuhmfxLI3IbhZFw0m/n3Q5qf3VfopDGZJQTGxV73aoqcJ1IeFAQbyHa4n2uE6VZRDBXVsNvuR83LVYjEgiTGAH-hoSvS43Pi0ZXdFHa9DqU/eHbPsWWOtckXIG7SIhwZ70=-i1i2Gb8Tfz?9KU@+*VG"

const { Client, CheckoutAPI } = require('@adyen/api-library');

// Initialize the client object
const client = new Client({apiKey: keyko, environment: "TEST"});

// Create the request object
const paymentRequest = {
  amount: {
    value: 10,
    currency: "PHP"
  },
  paymentMethod: {
    type: "gcash",
    storedPaymentMethodId: "7219687191761347"
  },
  reference: "ABC-001",
  merchantAccount: "VantazticIncECOM",
  shopperReference: "IOfW3k9G2PvXFu2j",
  shopperInteraction: "Ecommerce",
  recurringProcessingModel:"CardOnFile"
}

// Make the request
const checkoutAPI = new CheckoutAPI(client);
const response = checkoutAPI.PaymentsApi.payments(paymentRequest, { idempotencyKey: "sbu-UUID" });
console.log(response)
	//number : '09175761186,09985524618,09611164983',
	// console.log('***SENDING SMS*** ', msgbody)
	// let smsdata = {
	// 	apikey : '20dc879ad17ec2b41ec0dba928b28a69', //Your API KEY
	// 	number : '09611164983',			
	// 	message : msgbody,
	// 	sendername : 'SEMAPHORE'
    // }
	
	// fetcher('https://semaphore.co/api/v4/messages', {
	// 	method: 'POST',
	// 	body: JSON.stringify(smsdata),
	// 	headers: { 'Content-Type': 'application/json' }
	// })    
	// .then(res => res.json() )
    // .then(json => console.log ('sms ->', json ))
	
}

router.get("/pay", (req,res)=>{
	console.log('firing adyenpay')
	adyenpay()
})

router.get("/cookie3", (req, res) => {
	
    console.log('cookies',req.cookies['parser'])
	//if (!req.cookies) return res.status(401).send('error ka');
	res.status(200).json({ secret: "Ginger ale is a specific Root Beer" });
});



//get Main Malls
router.get('/getallmall', async(req,res) => {
    console.log('getallmall')
	connectPg()
    .then((db)=>{
        
        db.query(`select * from osndp_mall ORDER BY mall_name`, (err,data) => { 
		   
			if ( data.rows.length == 0) {   //data = array 
				console.log('no rec')
                res.status(400).json({
					voice:"No Matching Record!",
					found:false
				})  
				
				closePg(db);//CLOSE connection
                //console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")

            }else{ 
				console.log( 'all main malls ', data.rows )
				//cookie
				res.status(200).json({
					result	: 	data.rows,
					found	:	true
                })
				
                closePg(db);//CLOSE connection
                //console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")
            }//EIF
			
		})//END QUERY 
	
	}).catch((error)=>{
        res.status(500).json({error:'No Fetch Docs'})
    })		
})

//==get mall type
//get equipment for dropdown selection 
router.get('/getmall/:mallid', async(req,res) => {
    console.log('getmall ',req.params.mallid)
	connectPg()
    .then((db)=>{
        
		let sql = `select * from osndp_malldesc
		where mall_id ='${req.params.mallid.toUpperCase()}' 
		ORDER BY mall_id, mall_name`

		console.log(sql )

        db.query(sql, (err,data) => { 
		   
			if ( data.rows.length == 0) {   //data = array 
				console.log('no rec')
                res.status(400).json({
					voice:"No Matching Record!",
					found:false
				})  
				
				closePg(db);//CLOSE connection
                //console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")

            }else{ 
				console.log( 'mall data ', data.rows )
				//cookie
				res.status(200).json({
					result	: 	data.rows,
					found	:	true
                })
				
                closePg(db);//CLOSE connection
                //console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")
            }//EIF
			
		})//END QUERY 
	
	}).catch((error)=>{
        res.status(500).json({error:'No Fetch Docs'})
    })		
})

//==========get project assigned
router.get('/getProjectOwner/:dept', async(req,res) => {
    console.log('===getProjectOwner()/:', req.params.dept)
	let grp
	if(req.params.dept=='design'){
		grp = "2"
	}else{
		grp = "4"
	}

	connectPg()
    .then((db)=>{
        
        db.query(`select * from osndp_users where grp_id = ${grp} ORDER BY full_name`, (err,data) => { 
		   
			if ( data.rows.length == 0) {   //data = array 
				console.log('no rec')
                res.status(400).json({
					voice:"No Matching Record!",
					found:false
				})  
				
				closePg(db);//CLOSE connection
                //console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")

            }else{ 
				console.log( 'found all user in department ', req.params.dept, data.rows )
				//cookie
				res.status(200).json({
					result	: 	data.rows,
					found	:	true
                })
				
                closePg(db);//CLOSE connection
                //console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")
            }//EIF
			
		})//END QUERY 
	
	}).catch((error)=>{
        res.status(500).json({error:'No Fetch Docs'})
    })		
})



//FILTER MALL
router.get('/filterexpertise', async(req,res) => {
    connectPg()
    .then((db)=>{
        
		let sql = `select * from zonked_doctor_expertise ORDER BY expertise`

		console.log(sql )

        db.query(sql, (err,data) => { 
		   
			if ( data.rows.length == 0) {   //data = array 
				console.log('no rec')
                res.status(400).json({
					voice:"No Matching Record!",
					found:false
				})  
				
				closePg(db);//CLOSE connection
                //console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")

            }else{ 
				//console.log( 'expertise data ', data.rows )
				//cookie
				res.status(200).json({
					result	: 	data.rows,
					found	:	true
                })
				
                closePg(db);//CLOSE connection
                //console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")
            }//EIF
			
		})//END QUERY 
	
	}).catch((error)=>{
        res.status(500).json({error:'No Fetch Docs'})
    })		
})

//===approve for verification doctor
router.get('/approve/:dr_name/:dr_email', async (req, res) => {	
	connectPg()
    .then((db)=>{
		let sql = `UPDATE zonked_users 
				SET verified =1 
		 		WHERE full_name = '${req.params.dr_name}' and grp_id = 2 and verified = 0;`

		let sql2 =`	UPDATE zonked_doctor_list
			set verified = 1
			WHERE full_name = '${req.params.dr_name}' and verified = 0;	`
				
		db.query(`${sql};${sql2}`, (err,data) => {
			console.log( data[0].rowCount)
		
			if ( data[0].rowCount == 0) {   //data = array 
				//onsole.log('no rec')
				res.status(500).send({voice: 'CHANGES FAILED!'})
				
				closePg(db);//CLOSE connection
				//console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")

			}else{

				//email
				let transporter = nodemailer.createTransport({
					service:'gmail',
					auth:{
						user: 'ovusystem@gmail.com',
						pass: 'oudahgdrumecapqy'
					},
					tls:{
						rejectUnauthorized:false
					}
				})//end transpo
			
				let htmltemp = `
					Dear ${req.params.dr_name}, <br><br>
			
					Your account with us is now VERIFIED.  Please refer to the previous email for your credentials.<br><br>
			
					Thank you so much for Trusting US!!!<BR><BR>
			
					Sincerely,<BR>
					OVU Healthcare<br><br><br>
					<img height='40px' src='https://vantaztic.com/vanz/img/zonked_logo.png' />
				`
			
				const mailOptions ={
					from: 'ovusystem@gmail.com',
					to: req.params.dr_email,
					cc: 'carlodominguez@yahoo.com',
					subject: 'OVU registration Verified and Complete',
					html: htmltemp
				}
			
				transporter.sendMail(mailOptions,(err,info)=>{
					if(err){
						res.status(500).json({status:false, voice:'Registration Failed', message:'Registered Successfully' })
					}else{
						res.status(200).json({ status : true, voice:'Doctor Registered Successfully', message:'Registered Successfully' })
					}
				}) 

			}//eif
			closePg( db )
		})

	})
})

//============= getreport ==========//
router.get('/getreport', async (req,res) => {
	console.log('==getreport()')

	connectPg()
    .then((db)=>{


		let sql = `select distinct(
					CASE
					WHEN (grp_id) = 1 then 'Patient'
					WHEN (grp_id) = 2 then 'Doctor'
					ELSE 'Admin'
					end
					) as grp_id, count(grp_id)
					from zonked_users
					group by grp_id
					`

		db.query(sql, (err,data) => {
			if ( data.rows.length == 0) {   //data = array 
				//onsole.log('no rec')
                res.status(500).send('** No Record Yet! ***')
				
				closePg(db);//CLOSE connection
                //console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")
			}else{
				//cookie

				let txt = '',xdatas = []
				const curr_date = strdates()
	
				xdatas = data.rows

				console.log('redirecting', xdatas )
				
			
				//=== CREATE MEDRX ===========
				zonkedpdf.reportpdf( xdatas, curr_date )
				.then( reportfile =>{
					console.log('REPORT PDF SUCCESS!', reportfile, txt)
			
					//===PREPEARE EMAIL===========
					let transporter = nodemailer.createTransport({
						service:'gmail',
						auth:{
							user: 'ovusystem@gmail.com',
							pass: 'oudahgdrumecapqy'
						},
						tls:{
							rejectUnauthorized:false
						}
					})//end transpo
			
					let htmltemp = `
						Dear Admin, <br><br>
			
						Here's the latest registred count for OVU Systems. <BR><BR>
			
						Sincerely,<BR>
						OVU Healthcare<br><br><br>
						<img height='40px' src='https://vantaztic.com/vanz/img/zonked_logo.png' />
					`
			
					const mailOptions = {
						from: 'ovusystem@gmail.com',
						to:  'ovusystem@gmail.com',
						subject: 'OVU Systems Total Registration',
						html: htmltemp,
						attachments:[
							{
								filename: reportfile,
								path: `${reportfile}`,
								contentType: 'application/pdf'
							}
						]
					}
			
					transporter.sendMail(mailOptions,(err,info)=>{
						if(err){
							console.log('nope',err)
							res.status(500).json({status:false})
						}else{
							Utils.deletePdf(reportfile)
								.then(x => {
									if(x){
										console.log('*** Deleted temp file ', reportfile)
										Utils.deletePdf(reportfile)
										.then(x => {
											if(x){
												//=== RETURN RESULT ===//
												console.log('*** Deleted temp file ', reportfile)
										
												console.log('Emailed Successfully!')
												
												//update patient record
												closePg(db)
												res.status(200).json({status:true, xdata:xdatas})
						
											}//eif
										})//end utils.deletepdf
									}//eif
							})//end Utils.deletepdf
						}//===eif
					})//=========end transport email
			
				})//==== CREATE MEDRX =============== 

				//=================WOW

				
				//============END WOW


				//res.status(200).json({status:true, xdata:data.rows})
			}	//eif
		})		

	}).catch((error)=>{
		res.status(500).json({error:'No Fetch Docs'})
	})

})

router.get('/reportmail/:xdatas', async(req,res)=>{

	console.log( req.param.xdatas) 
	let xdatas = []
	xdatas = req.param.xdatas
	return false

	//consoe
	const curr_date = getDate()
	
	let txt = ""

	xdatas.forEach( (element) => {
		txt += `${element.grp_id} :    ${element.count}<br>`
	})
	//=== CREATE MEDRX ===========
	zonkedpdf.reportpdf( txt, curr_date )
	.then( reportfile =>{
		console.log('REPORT PDF SUCCESS!', reportfile, txt)

		//===PREPEARE EMAIL===========
		let transporter = nodemailer.createTransport({
			service:'gmail',
			auth:{
				user: 'ovusystem@gmail.com',
				pass: 'oudahgdrumecapqy'
			},
			tls:{
				rejectUnauthorized:false
			}
		})//end transpo

		let htmltemp = `
			Dear Admin, <br><br>

			Here's the latest registred count for OVU Systems. <BR><BR>

			Sincerely,<BR>
			OVU Healthcare<br><br><br>
			<img height='40px' src='https://vantaztic.com/vanz/img/zonked_logo.png' />
		`

		const mailOptions = {
			from: 'ovusystem@gmail.com',
			to:  'ovusystem@gmail.com',
			subject: 'OVU Systems Total Registration',
			html: htmltemp,
			attachments:[
				{
					filename: reportfile,
					path: `${reportfile}`,
					contentType: 'application/pdf'
				}
			]
		}

		transporter.sendMail(mailOptions,(err,info)=>{
			if(err){
				console.log('nope',err)
				res.status(500).json({status:false})
			}else{
				Utils.deletePdf(medcertfile)
					.then(x => {
						if(x){
							console.log('*** Deleted temp file ', reportfile)
							Utils.deletePdf(reportfile)
							.then(x => {
								if(x){
									//=== RETURN RESULT ===//
									console.log('*** Deleted temp file ', reportfile)
							
									console.log('Emailed Successfully!')
									
									//update patient record
									res.status(200).json({status:true, xdata:xdatas})
			
								}//eif
							})//end utils.deletepdf
						}//eif
				})//end Utils.deletepdf
			}//===eif
		})//=========end transport email

	})//==== CREATE MEDRX =============== 
})


//==== get for verification doctor list
router.get('/getapprovalreg', async (req, res) => {	
	connectPg()
    .then((db)=>{

		let sql = `select a.full_name,
				b.expertise,
				a.email
				from zonked_users a
				join zonked_doctor_list b 
				on a.full_name = b.full_name
				where a.grp_id = 2 and a.verified = 0;`

		//console.log( sql )
		db.query(sql, (err,data) => {
			if ( data.rows.length == 0) {   //data = array 
				//onsole.log('no rec')
                res.status(500).send('** No Record Yet! ***')
				
				closePg(db);//CLOSE connection
                //console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")

            }else{
				let cnt = 0

				let xtable = 
				`
				<div class="col-lg">
					<table class="table"> 
					<thead>
						<tr>
						<th id='thh'>NAME</th>
						</tr>
					</thead>
					<tbody>`

					for(let zkey in data.rows){

						xtable+= `
						<tr>
						<td align=left>
						<div class="text-wrap">
						<b>Dr. ${data.rows[zkey].full_name}</b><hr>
						${data.rows[zkey].expertise}
						</div>	
						</td>
						</tr>
						<tr>
						<TD>
						<button type='button' onclick='javascript:zonked.approve("${data.rows[zkey].full_name}","${data.rows[zkey].email}")' class='btn btn-success btn-sm'>Approve</button>
						</TD>
						</tr>
						`
					}//endfor
				

				xtable+=	
					`
					</tbody>
					</table>
					</div>`
				console.log( '***for reg doctors', data.rows )
				closePg(db);//CLOSE connection
				//cookie
				res.status(200).send(xtable)
			}//endif
		})
	}).catch((error)=>{
        res.status(500).json({error:'No Fetch Docs'})
	})
})


//get patient history
router.get('/getpatienthistory/:docid/:case_no/:page', async (req, res) => {	
	console.log('==getting history===', req.params.docid, req.params.case_no)

	connectPg()
    .then((db)=>{
		//console.log('==getting history===')
		let casetext

		if(req.params.case_no!=="0"){
			casetext = ` a.case_no='${req.params.case_no}' and a.status = 0 `
		}else{
			casetext = ` a.dr_id = ${req.params.docid} and a.status = 0 `
		}//eif
	
		const sql = `select a.*,b.email,c.license
			from zonked_doctor_schedule a
			join zonked_patient_history b
			on b.case_no = a.case_no 
			join zonked_doctor_list c
			on c.full_name = a.dr_name
			where ${casetext}  and ( a.book_month = date_part('month',current_date) 
			and  a.book_day >= date_part('day',current_date) 
			and a.book_year = date_part('year',current_date) )
			ORDER by a.book_month, a.book_day, a.book_hour; `
				
		//console.log( sql )
		
		//for pagination
		const limit_num = 1
		let nStart = 0
		let page = req.params.page
		
		db.query(sql, (err,zdata) => { 
			//console.log('data',zdata)
			
			if ( zdata.rows.length == 0) {   //data = array 
				console.log('no rec')
				closePg(db);//CLOSE connection
		
				res.status(500).send('** No Patient Record Yet! ***')
		
			}else{ 
			
				reccount = zdata.rows.length
				//==== for next
				let aPage = []
				let pages = Math.ceil( zdata.rows.length / limit_num )
				
				nStart = 0
				
				for (let i = 0; i < pages; i++) {
					aPage.push(nStart)
					nStart += parseInt(limit_num)
				}//==next
			
				//start changes
				let sql2 = `select a.*,b.email,c.license
					from zonked_doctor_schedule a
					join zonked_patient_history b
					on b.case_no = a.case_no 
					join zonked_doctor_list c
					on c.full_name = a.dr_name
					where ${casetext}  and ( a.book_month = date_part('month',current_date) 
					and  a.book_day >= date_part('day',current_date) 
					and a.book_year = date_part('year',current_date) )
					ORDER by a.book_month, a.book_day, a.book_hour
					LIMIT ${limit_num} OFFSET ${aPage[page-1]}; `
		
					db.query(sql2, (err,data) => { 
						//===============main template
						const aMonth = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]

						const _aDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

						_ddays = new Date(`${parseInt(data.rows[0].book_month)}/${data.rows[0].book_day}/2024`).toLocaleString('en-PH',{weekday:'long'})
						//xdays =new Date(`${parseInt(data.rows[0].book_month)}/${data.rows[0].book_day}/2024`)
						//console.log(xdays)

						let xhr	
						let doclicense
						let patientemail
						let cnt = 0
						let xtable = 
						`
							<table class="table"> 
							<thead>
								<tr>
								<th colspan=2>Patient History</th>
								</tr>
							</thead>
							<tbody>`

						//====FOR NEXT =======			
						for(let zkey in data.rows){
							doclicense = data.rows[zkey].license
							patientemail = data.rows[zkey].email

							xhr = ( parseInt(data.rows[zkey].book_hour) >= 12 ? data.rows[zkey].book_hour + ':00 PM': data.rows[zkey].book_hour + ':00 AM')

							cnt++
							xtable+= `<tr>
							<td ><i class="fa fa-ambulance"></i> <b>Booking No.</b></td>
							<td><b>${data.rows[zkey].case_no}</b></td>
							<tr>
							<td><i class="fa fa-user-md"></i> Patient Name</td>
							<td> <span id='patient'>${data.rows[zkey].patient_name}</span></td>
							</tr>
							<td><i class="fa fa-user-md"></i> Patient Email</td>
							<td> <span id='patient_email'>${data.rows[zkey].email}</span></td>
							</tr>
							<tr>
							<td><i class="fa fa-calendar-check-o"></i> Last Period</td>
							<td> ${formatdates(aMonth,data.rows[zkey].patient_last_menstruate)}</td>
							</tr>
							<tr>
							<td><i class="fa fa-stethoscope" aria-hidden="true"></i> Date Checkup</td>
							<td >
							<span id=checkup>
							<i class="fa fa-calendar" aria-hidden="true"></i>
							${aMonth[ parseInt(data.rows[zkey].book_month)-1]} ${data.rows[zkey].book_day}
							${_ddays}<br><i class="fa fa-clock-o" aria-hidden="true"></i> ${xhr}
							</span>
							</td>
							</tr>
							<tr>
							<td><i class="fa fa-medkit"></i> Complaints</td>
							<td style="white-space:normal !important;word-wrap:break-word;min-width:160px;max-width:160px;">
							<span id=complaint>${data.rows[zkey].complaints}</span></td>
							</tr>
							<tr>
							<td colspan=4 >
							<button class='btn btn-secondary' onclick="javascript:zonked.declinePatient('${data.rows[zkey].case_no}')" ><i class="fa fa-thumbs-down" ></i>&nbsp;&nbsp;DECLINE</button>
							</td>
							</tr>`
						}//====for next

						//==============end main template
					
						//============for pagination
						let xprev = ((page-1)>0?'':'disabled')
						let xnext = ((page>=pages)?'disabled':'')
						let mypagination = "", main = "", xclass = ""
						//===mypagination is for pagination
						
						//===final pagination
						mypagination+=`
						<nav aria-label="Page navigation example">
						  <ul class="pagination">`
						
						//==== previous link
						mypagination += `<li class="page-item ${xprev}">
					<a class="page-link" href="javascript:zonked.getpatientBooking(${parseInt(req.params.page)-1},${req.params.docid},${req.params.case_no})">Previous</a></li>`
						
						for(let x=0; x < pages; x++){
							
							if( req.params.page==(x+1)){
								xclass = "disabled"
							}else{
								xclass = ""
							}
							//==== number page
							mypagination += `<li class="page-item ${xclass}">
							<a class="page-link"  href="javascript:zonked.getpatientBooking(${x+1},${req.params.docid},${req.params.case_no})">${x+1}</a></li>`
							
						}//end for
						
						//=======next link
						mypagination += `<li class="page-item ${xnext}">
						<a class="page-link" href="javascript:zonked.getpatientBooking(${parseInt(req.params.page)+1},${req.params.docid},${req.params.case_no})">Next</a></li>`
						
						mypagination+=`
						</ul>
						</nav>`
						
						xtable+=	
							`<tr>
							<td colspan=4 align='center'>
							 ${mypagination}<div id='reccount' style='visibility:hidden' >${reccount}</div>
							</td>
							</tr>
							</tbody>
							</table>
							<input type='text' style='visibility:hidden' readonly id='patient_emailx' name='patient_emailx' value='${patientemail}' >
							<input type='text' style='visibility:hidden' readonly id='doc_license' name='doc_license' value='${doclicense}' >
							`
						closePg(db);//CLOSE connection
			
						res.status(200).send(xtable)
						
					})//end dbquery
					
	
				//end changes oct 28, 2k24
			}//EIF
			
		})//end db.query
		
		
	}).catch((error)=>{
        res.status(500).json({error:'No Fetch Docs'})
	})
})

const formatdates = (aMonth,xdate) =>{
	let today = new Date(xdate)
	var dd = String(today.getDate()).padStart(2,'0')
	var mm = String(today.getMonth()+1).padStart(2,'0')
	var yyyy = today.getFullYear()

	today = aMonth[today.getMonth()]+'. '+dd+', '+yyyy
	return today
}



const getDate = () =>{
	let today = new Date()
	var dd = String(today.getDate()).padStart(2,'0')
	var mm = String(today.getMonth()+1).padStart(2,'0')
	var yyyy = today.getFullYear()

	today = mm +'/'+dd+'/'+yyyy
	return today
} 

const strdates = () =>{
	let today = new Date()
	var dd = String(today.getDate()).padStart(2,'0')
	var mm = String(today.getMonth()+1).padStart(2,'0')
	var yyyy = today.getFullYear()

	today = mm +'_'+dd+'_'+yyyy
	return today
}

//project zonked get history
router.get('/gethistory/:userid', async (req, res) => {	
	connectPg()
    .then((db)=>{
	
		//console.log('==getting history===')
		let sql = `select
				* from zonked_doctor_schedule 
				where user_id = ${req.params.userid} and ( status = 0 or status = 2 )
				and book_month = date_part('month',current_date)
				and  book_day >= date_part('day',current_date)
				and book_year = date_part('year',current_date) 
				ORDER by book_month, book_day, book_hour; `
		
		db.query(sql, (err,data) => { 
		   
			if ( data.rows.length == 0) {   //data = array 
				console.log('no rec')
                res.status(500).send('** No Record Yet! ***')
				
				closePg(db);//CLOSE connection
                //console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")

            }else{ 
				let xwarning
				let xshow
				if(data.rows[0].status==2){
					xshow = "disabled"
					xwarning = `<font color=red><i class="fa fa-frown-o"></i>&nbsp;The Doctor <u>DECLINED your Booking</u>.  This is due to emergency matters, 
					schedule conflicts or any unforeseen events! You may try to book for other dates.<br>Thank you for using OVU Healthcare.</font>`
				}else{
					xshow = ""
					xwarning=""
				}
				const aMonth = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]

				const _aDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

				//_ddays = new Date(`${data.rows[0].book_day}/${parseInt(data.rows[0].book_month)-1}/2024`)	
				_ddays = new Date(`${parseInt(data.rows[0].book_month)}/${data.rows[0].book_day}/2024`).toLocaleString('en-PH',{weekday:'long'})
				
				let xhr				
				let cnt = 0

				let xtable = 
				`
					<table class="table"> 
					<thead>
						<tr>
						<th colspan=2>Patient History</th>
						</tr>
					</thead>
					<tbody>`

					for(let zkey in data.rows){

						xhr = ( parseInt(data.rows[zkey].book_hour) >= 12 ? data.rows[zkey].book_hour + ':00 PM': data.rows[zkey].book_hour + ':00 AM')

						cnt++
						xtable+= `<tr>
						<td><i class="fa fa-ambulance"></i> <b>Booking No.</b></td>
						<td><b>${data.rows[zkey].case_no}</b></td>
						<tr>
						<td><i class="fa fa-user-md"></i> Doctor</td>
						<td>Dr. ${data.rows[zkey].dr_name}</td>
						</tr>
						<tr>
						<td><i class="fa fa-stethoscope" aria-hidden="true"></i> Date Checkup</td>
						<td ><i class="fa fa-calendar" aria-hidden="true"></i>
						${aMonth[ parseInt(data.rows[zkey].book_month)-1]} ${data.rows[zkey].book_day}
					 	${_ddays}<br><i class="fa fa-clock-o" aria-hidden="true"></i> ${xhr}
						</td>
						</tr>
						<tr>
						<td><i class="fa fa-medkit"></i> Complaints</td>
						<td style="white-space:normal !important;word-wrap:break-word;min-width:160px;max-width:160px;">
						${data.rows[zkey].complaints}</td>
						</tr>
						<tr>
						<td colspan=2 style='white-space:normal'>${xwarning}
						</td>
						</tr>
						<tr>
						<td colspan=2>
												
						<div class='btn-group-vertical' role='group'>
						
						<button type='button' ${xshow} id='call-btn-${zkey}' class='btn btn-success' 
							onclick='javascript:zonked.callDoctor("${data.rows[zkey].dr_name}","${data.rows[zkey].case_no}")'>
							<i class="fa fa-phone"></i>&nbsp;Call Dr. ${data.rows[zkey].dr_name} 
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
				console.log( '***patient history ' )
				closePg(db);//CLOSE connection
				//cookie
				res.status(200).send(xtable)
				//console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")
            }//EIF
			
		})//END QUERY 
	
	}).catch((error)=>{
        res.status(500).json({error:'No Fetch Docs'})
	})

})

///create pdf and send email
router.post('/medrxpost/', async (req, res) => {

	const curr_date = getDate()
	 console.log( '==medrxpost()==>',req.body, req.body.rx)

	//==== CREATE MEDCERT FIRST===============
	zonkedpdf.medcertpdf( req, curr_date )
	.then( medcertfile =>{
		console.log('MEDCERT PDF SUCCESS!', medcertfile)

		//=== CREATE MEDRX ===========
		zonkedpdf.medrxpdf( req, curr_date )
		.then( medrxfile =>{
			console.log('MED RX  PDF SUCCESS!', medrxfile, req.body)

			//===PREPEARE EMAIL===========
			let transporter = nodemailer.createTransport({
				service:'gmail',
				auth:{
					user: 'ovusystem@gmail.com',
					pass: 'oudahgdrumecapqy'
				},
				tls:{
					rejectUnauthorized:false
				}
			})//end transpo

			let htmltemp = `
				Dear ${req.body.fpatient}, <br><br>

				Please find attached Medical Certificate and Prescription:<br><br>

				Thank you so much for Trusting US!!!<BR><BR>

				Sincerely,<BR>
				OVU Healthcare<br><br><br>
				<img height='40px' src='https://vantaztic.com/vanz/img/zonked_logo.png' />
			`

			const mailOptions = {
				from: 'ovusystem@gmail.com',
				to: req.body.femail,
				subject: 'OVU Medical Certificate and Prescription',
				html: htmltemp,
				attachments:[
					{
						filename: medcertfile,
						path: `${medcertfile}`,
						contentType: 'application/pdf'
					},
					{
						filename: medrxfile,
						path: `${medrxfile}`,
						contentType: 'application/pdf'
					}
				]
			}

			transporter.sendMail(mailOptions,(err,info)=>{
				if(err){
					console.log('nope',err)
					res.status(500).json({status:false, voice:'SendMail Failed', message:`SendMail FAILED!, posted ${req.body}` })
				}else{
					Utils.deletePdf(medcertfile)
						.then(x => {
							if(x){
								console.log('*** Deleted temp file ', medcertfile)
								Utils.deletePdf(medrxfile)
								.then(x => {
									if(x){
										//=== RETURN RESULT ===//
										console.log('*** Deleted temp file ', medrxfile)
								
										console.log('Emailed Successfully!')
										
										//update patient record
										return res.redirect(`/updatepatientrecord/${req.body.fcaseno}`)
				
									}//eif
								})//end utils.deletepdf
							}//eif
					})//end Utils.deletepdf
				}//===eif
			})//=========end transport email

		})//==== CREATE MEDRX =============== 

	})//=====  CREATE MEDCERT =====================
})

//=========== CREATE NEW DOCTOR SCHED =====//
router.put('/writesched/:docname', async( req, res )=> {

	connectPg()
    .then((db)=>{
		let sql = `UPDATE zonked_doctor_list
				SET schedule = '${JSON.stringify(req.body)}' 
		 		WHERE full_name = '${req.params.docname}' ;`

		db.query(`${sql}`, (err,data) => {
			console.log( 'writesched()',data.rowCount)
		
			if ( data.rowCount == 0) {   //data = array 
				
				closePg(db);//CLOSE connection
				res.status(500).json({ status : false, voice:'Error changing Schedule!', message:'Error changing Schedule!' })			
			}else{

				res.status(200).json({ status : true, voice:'Schedule Changed Successfully', message:'Schedule Changed Successfully' })			
			}//eif
			closePg( db )
		}) //end db.query 
	})//tne .then(db)
})

//===========decline patient 
router.put('/declinepatient/:caseno', async(req,res)=>{
	console.log('declining', req.params.caseno)
	connectPg()
    .then((db)=>{
		let sql = `UPDATE zonked_patient_history
				SET status = 2 
		 		WHERE case_no = '${req.params.caseno}' ;`

		let sql2 =`	UPDATE zonked_doctor_schedule
			set status = 2
			WHERE case_no = '${req.params.caseno}' ;	`
				
		db.query(`${sql};${sql2}`, (err,data) => {
			console.log( 'update status record to closed',data[0].rowCount)
		
			if ( data[0].rowCount == 0) {   //data = array 
				//onsole.log('no rec')
				
				//console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")
				res.status(500).json({ status : false, voice:'Error', message:'Error' })
			}else{

				res.status(200).json({ status : true, voice:'Booking Declined Successfully', message:'Booking Declined Successfully' })			
			}//eif

			closePg( db )
		}) //end db.query 
	})//tne .then(db)
})


router.get('/updatepatientrecord/:caseno', async(req,res)=>{

	connectPg()
    .then((db)=>{
		let sql = `UPDATE zonked_patient_history
				SET status = 1 
		 		WHERE case_no = '${req.params.caseno}' ;`

		let sql2 =`	UPDATE zonked_doctor_schedule
			set status = 1
			WHERE case_no = '${req.params.caseno}' ;	`
				
		db.query(`${sql};${sql2}`, (err,data) => {
			console.log( 'update status record to closed',data[0].rowCount)
		
			if ( data[0].rowCount == 0) {   //data = array 
				//onsole.log('no rec')
				
				closePg(db);//CLOSE connection
				//console.log("===MYSQL CONNECTON CLOSED SUCCESSFULLY===")

			}else{

				res.status(200).json({ status : true, voice:'Certificate Emailed Successfully', message:'Certificate Emailed Successfully' })			
			}//eif
			closePg( db )
		}) //end db.query 
	})//tne .then(db)
	
})

//Register User/Doctors
router.post('/registerpost/', async (req, res) => {	
	connectPg()
    .then((db)=>{

		let checksql = `select * from zonked_users where email= '${req.body.remail}'`
		/// please go back here to prevent using the same email over and over
		
		db.query(checksql,(err,data)=>{
			if(data.rows.result>0){
				//if found
				res.status(500).json({status:false, voice:'Email already Enrolled', message:'Email already Enrolled.'})

			}else{
				//proceed with reg
				let verified, grpid

				if(req.body.user_type=="patient"){
					verified = 1
					grpid = 1
				}else{
					verified = 0
					grpid = 2
				}
		
				if(grpid == 2){
					console.log('inserting doctor', req.body, req.body.expertise_container )
		
		
					let sql = `INSERT INTO zonked_doctor_list ( full_name, expertise, verified, license ) 
						VALUES($1, $2, $3, $4) RETURNING * `
						console.log(sql)
					db.query( sql ,
						[ 	req.body.rname.toUpperCase(),
							req.body.expertise_container,
							verified,
							req.body.license 
						],
						(error,result)=>{
							console.log('inserting new doctor..',result.rowCount)
							// //return res.redirect(`/mailer/${req.body.rname.toUpperCase()}/${req.body.remail}/${req.body.rpwd}`)
							// res.json({
							// 	mail_name: req.body.rname.toUpperCase(),
							// 	mail_email: req.body.remail,
							// 	mail_pwd: req.body.rpwd,
							// 	message: "User Added Successfully!",
							// 	voice:"User Added Successfully!",
							// 	approve_voice:`You have another item added in Inventory`,
							// 	status:true
							// })
							
						
						//closePg(db);//CLOSE connect
						
					})
					
				}//eif
		
				let sql2 =	`INSERT INTO zonked_users ( full_name, grp_id, email, pwd, verified, dob ) 
					VALUES($1, $2, $3, $4, $5, $6) RETURNING * `
		
				console.log( sql2)
		
				db.query( sql2, 
					[ 	req.body.rname.toUpperCase(),
						grpid,
						req.body.remail,
						req.body.rpwd,
						verified ,
						req.body.rdob ],
					(error,results)=>{
						console.log('inserting new user..',results.rowCount)
						//CALL subroutine sub-api
						return res.redirect(`/mailer/${req.body.rname.toUpperCase()}/${req.body.remail}/${req.body.rpwd}`)
						/*
						res.json({
							mail_name: req.body.rlname.toUpperCase(),
							mail_email: req.body.remail,
							mail_pwd: req.body.rpwd,
							message: "User Added Successfully!",
							voice:"User Added Successfully!",
							approve_voice:`You have another item added in Inventory`,
							status:true
						})
						*/
						
					closePg(db);//CLOSE connect
					
				})
		
			}//endif
		})
		
	}).catch((error)=>{
        res.status(500).json({error:'Error'})
    }) 
})


//=== new site Post
router.post('/bookingpost/', async (req, res) => {	
   
    console.log("Posting.. ", req.body )
	
	connectPg()
    .then((db)=>{
		 
		db.query(`INSERT INTO zonked_doctor_schedule (dr_id, dr_name, book_hour, book_month, book_day, book_year, 
				patient_name, complaints, patient_last_menstruate, user_id, case_no ) 
			VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING * `,
			[ 	parseInt(req.body.fdoctor_id),
				req.body.fdoctor.toUpperCase(),
				parseInt( req.body.fbookhour),
				parseInt( req.body.book_month),
				parseInt( req.body.book_day), 
				parseInt('2024'),
				req.body.fname.toUpperCase(),
				req.body.fcomplain,
				req.body.fmens,
				parseInt( req.body.fuserid),
				req.body.fcase
			],
			(err,result) =>{
				console.log('inserting doctor.',result.rowCount)
			
		})

		db.query(`INSERT INTO zonked_patient_history ( full_name, email, dr_assigned, dr_name, 
			complaints, last_menstruate, user_id, details, case_no ) 
			VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING * `,
			[ 	req.body.fname.toUpperCase(),
				req.body.femail,
				parseInt(req.body.fdoctor_id),
				req.body.fdoctor.toUpperCase(),
				req.body.fcomplain,
				req.body.fmens,
				parseInt( req.body.fuserid),
				JSON.stringify(req.body) ,
				req.body.fcase
			],
			(error,results)=>{
				console.log('inserting patient..',results.rowCount)
				res.json({
					message: "Booking Added Successfully!",
					voice:"Booking Added Successfully!",
					approve_voice:`You have another item added in Inventory`,
					status:true
				})
	
			closePg(db);//CLOSE connection
			
		})
		
    }).catch((error)=>{
        res.status(500).json({error:'Error'})
    }) 
	
})

//=== new site Post
router.post('/newsitepost/:dateadd', async (req, res) => {	
   
    console.log("Posting.. ", req.body )
	mycookie = req.body.serial_pdf;

	connectPg()
    .then((db)=>{
		 
		db.query(`INSERT INTO osndp_site ( site_number, mall, mall_name, business_name, 
			trade_name, area_size, rates,
			lease_term_start, lease_term_end, date_signed,
			details, date_add, remarks, proj_mgr, proj_design) 
			VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING * `,
			[ req.body.serial,req.body.mall_type,req.body.mall_description,
				req.body.business_name.toUpperCase(),req.body.trade_name.toUpperCase(),
				parseFloat(req.body.area_size),
				parseFloat(req.body.area_rate),
				req.body.lease_term_start,
				req.body.lease_term_end,
				req.body.contract_sign,
				JSON.stringify(req.body), 
				req.params.dateadd,
				req.body.remarks,
				req.body.proj_engr,
				req.body.proj_design ],
			(error,results)=>{
				console.log('inserting..',results.rowCount)
				res.json({
					message: "Serial No. " + req.body.serial +" Added Successfully!",
					voice:"New Site Added Successfully!",
					approve_voice:`You have another item added in Inventory`,
					status:true
				})
	
				closePg(db);//CLOSE connection
			
		})
		
    }).catch((error)=>{
        res.status(500).json({error:'Error'})
    }) 
	
})

//==============busboy, scp2  for file uploading============
const Busboy = require('busboy');

router.post('/uploadpdf',  async(req, res)=>{

	console.log('===FIRING uploadpdf()===')

	const busboy = Busboy({ headers: req.headers });
		
	busboy.on('file', function(fieldname, file, filename) {
		console.log( 'firing busboy on file() ==', mycookie,filename)

		// fieldname is 'fileUpload'
		var fstream = fs.createWriteStream(mycookie +'.pdf');
		
		file.pipe(fstream)
			
		console.log( 'Writing Stream... ', fstream.path )

		file.resume()

		fstream.on('close', function () {
			console.log('Closing Stream, Trying to Up load...')
			ftpclient.scp(fstream.path, {
				host: "gator3142.hostgator.com", //--this is orig ->process.env.FTPHOST,
				//port: 3331, // defaults to 21
				username: "vantazti", // this is orig-> process.env.FTPUSER, // defaults to "anonymous"
				password: "2Timothy@1:9_10",
				path: 'public_html/osndp/'
			}, function(err) {
				console.log("File Uploaded!!!");
				
				//==delete file
				fs.unlink( fstream.path,()=>{
					console.log('Delete temp file ', fstream.path)
					res.status(200).send({ success: true });
				})

			})
			
		}); 
	});
	
	busboy.on('finish',()=>{
		console.log('busboy.on.finish() DONE!==')
	}) //busboy on finish

	//write file
	req.pipe(busboy)
		
})//==end upload

let xselectid

//==== getdoctorsched====
router.get('/getdoctorsched/:doc_id/:doc_name', async(req,res) => {
	const dmonth = new Date();
	//console.log('**getdoctorsched**',dmonth.getMonth())
	let aMonth = [
		"JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"
	]
	let xmonth = dmonth.getMonth()+1
   
	let xtable = "<table border=1>"
    
	//const ddays =  parseInt( xmonth.getDate())
	const xdays = new Date(dmonth.getFullYear(), xmonth, 0).getDate();

	console.log( xmonth, xdays, req.params.doc_id )

	connectPg()
	.then((db)=>{
	
		const sql = `select distinct(book_month),
					book_day,
					book_hour,
					book_year
					from zonked_doctor_schedule 
					where book_month =  date_part('month',current_date)
					and dr_id =  ${req.params.doc_id}
					and book_day >= date_part('day',current_date)
					and book_year =  date_part('year',current_date)
					group by book_month,
					book_day,
					book_hour,
					book_year
					ORDER BY book_hour ASC;
					`
		//console.log(sql)
		const sql2 = `select jsonb_array_elements(schedule) as sched from zonked_doctor_list where full_name = '${req.params.doc_name}';`

		
		let _xdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		let _ddays		
		let _xhour = []

		//db.query(sql,(err,data)=>{
		db.query(`${sql};${sql2}`, (err,data) => {
			//console.log('mydata getdoctorSched() ',data[0].rowCount, data[1].rowCount, JSON.stringify(data[1].rows))
			
			let aSched = [] 
			aSched.push(data[1].rows)

			let _addays = [], _astart = [], _aend = []

			//
			for(let mkey in aSched[0]){
				_addays.push( aSched[0][mkey].sched.day)
				_astart.push( aSched[0][mkey].sched.start )
				_aend.push( aSched[0][mkey].sched.end )
							
			}//==next

			//console.log( _addays, _astart, _aend )

			aDont = []
			adontMain = []

			const today = new Date()
			let hr
			if(parseInt(today.getHours()) >= 17){
				hr = today.getDate()+1 //display next day
			}else{
				hr = today.getDate()
			}
			 //get current date and start displaying calendar with the current day
			
			//console.log('hour =>', today.getHours())

				for (let xx = hr; xx <= xdays; xx++) {

					//_ddays = new Date(`2024-${xmonth-1}-${xx}`)	
					_ddays = new Date(`${today.getMonth()+1}/${xx}/2024`).toLocaleString('en-PH',{weekday:'long'})

					if(_addays.includes(_ddays)){

						//get position to get start and end
						let xpos = _addays.indexOf(_ddays)
						//console.log( _astart[xpos], _aend[xpos])
						for (let i = parseInt(_astart[xpos]); i <  parseInt(_aend[xpos]); i++) {
							_xhour.push(i)
						}

						xtable += 
						`<div class="row row-striped">
							<div class="col-2 text-right text-nowrap">
								<h1 class="display-4"><span class="badge badge-secondary">${xx}</span></h1>
								<h2>${aMonth[xmonth-1]}</h2>
							</div>
							<div class="col-10">
								<h3 class="text-uppercase"></h3>
								<ul class="list-inline text-nowrap">
									<li class="list-inline-item"><i class="fa fa-calendar-o" aria-hidden="true"></i> ${_ddays}</li>
									<li class="list-inline-item">

									<select  id='${xmonth}-${xx}'>`
									let option, cnt = 0
									
									//_xhour = [9,10,11,13,14,15,16,17]
									console.log(_xhour)
									
									for(let mkey in data[0].rows){
										if(data[0].rows[mkey].book_day == xx){
											//adontMain.push( xx)
											//aDont.push( data.rows[mkey].book_hour)
											if( _xhour.includes( data[0].rows[mkey].book_hour) ){
												
												let pos = _xhour.indexOf( data[0].rows[mkey].book_hour )
												
												//remove it from the list
												delete _xhour[pos]
											}//eif
										}//eif
									}//endfor
									
									
									for(let xkey in _xhour){
										option += `<option value='${xmonth},${xx},${_xhour[xkey]}'>${_xhour[xkey]}:00</option>`
										cnt++
									}//=== FOR NEXT
																		
									xtable += option 
									
									xtable +=	`</select></li>
									<li class="list-inline-item"><i class="fa fa-user" aria-hidden="true"></i>
									${cnt} Slot(s)
									</li>

								</ul>
								<p>
								<button id='calendarbtn-${xx}' type="button" data-dismiss="modal" onclick="javascript:util.modalshowSave('examplemodal','${req.params.doc_name}','${req.params.doc_id}','${xmonth}-${xx}');" class="btn btn-primary" style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;">
									<i class="fa fa-calendar"></i>&nbsp; Book Appointment
								</button>
								</p>
							</div>
						</div>`
					}//=========endif
					_xhour.length = 0
				}//=========end for


				xtable += "</table>"

				closePg(db)
				
				res.status(200).send(xtable)
			
		})

	}).catch((error)=>{
		res.status(500).json({error:'No Fetch Docs'})
	})		

})

const xsaver = (xwhat) =>{
	console.log(xwhat)
	return xwhat
}



router.get('/mailer/:xname/:xemail/:xpwd', async(req,res)=>{
	let transporter = nodemailer.createTransport({

		service:'gmail',
		auth:{
			user: 'ovusystem@gmail.com',
			pass: 'oudahgdrumecapqy'
		},

		tls:{
			rejectUnauthorized:false

		}
	})//end transpo

	let htmltemp = `
		Dear ${req.params.xname}, <br><br>

		Thank You for registering with Us!<br><br>

		Here's your credentials:<br><br>
		Username : ${req.params.xemail}<br>
		password : ${req.params.xpwd}
		<br><br>

		For "Health Professionals / Doctors" that registered, please wait for the Admin's approval of your login account.<br><br>

		Thank you so much for Trusting US!!!<BR><BR>

		Sincerely,<BR>
		OVU Healthcare<br><br><br>
		<img height='40px' src='https://vantaztic.com/vanz/img/zonked_logo.png' />
	`

	const mailOptions ={
		from: 'ovusystem@gmail.com',
		to: req.params.xemail,
		bcc: 'carlodominguez@yahoo.com',
		subject: 'OVU Registration Info',
		html: htmltemp
	}

	transporter.sendMail(mailOptions,(err,info)=>{
		if(err){
			res.status(500).json({status:false, voice:'Registration Failed', message:'Registration FAILED!' })
		}else{
			res.status(200).json({ status : true, voice:'Registered Successfully', message:'Registered Successfully' })
		}
	})
})

//======sample pagination
//=====https://localhost:3000/q/6/2 
router.get('/getalldoctors/:expertise/:limit/:page', async(req,res) => {
	
	console.log(`firing getall/${req.params.expertise}/${req.params.limit}/${req.params.page}`)

	const limit_num = req.params.limit
	let nStart = 0
	let page = req.params.page
	
	connectPg()
	.then((db)=>{
		
		const sql = `select a.id as xid,
		a.full_name,
		b.* 
		from zonked_doctor_list b  
		join zonked_users a
		on a.full_name = b.full_name
		where b.verified = 1 and lower(b.expertise) like  '%${req.params.expertise.toLowerCase()}%'`
		//console.log(sql)
		
		let reccount = 0
		let subspecialty = null

		db.query(sql,(err,data)=>{
			
			if(data.rows.length==0){
				res.send("<span class='text-primary'>** No Data Found!!!**</span>")
			}else{

				reccount = data.rows.length
				//==== for next
				let aPage = []
				let pages = Math.ceil( data.rows.length / limit_num )
				
				nStart = 0
				
				for (let i = 0; i < pages; i++) {
					aPage.push(nStart)
					nStart += parseInt(limit_num)
				}//==next
				
				//console.log('offset ',aPage)
				//===get from json field 
				let sql2 = `
					select a.id as xid,
					a.full_name,
					b.* 
					from zonked_doctor_list b  
					join zonked_users a
					on a.full_name = b.full_name
					where b.verified = 1 and lower(b.expertise) like  '%${req.params.expertise.toLowerCase()}%'
					LIMIT ${limit_num} OFFSET ${aPage[page-1]}`
				
				//onsole.log(sql2)
				console.log( 'doctors data ', data.rows )
				
				db.query(`${sql2}`,(err,data)=>{
					
					let mytable = `
							<table class="table">
							<thead>
								<tr>
								  <th  colspan=4>Result for "${req.params.expertise.toUpperCase()}"</th>
								</tr>
							</thead>
							<tbody >`
					
					let randpct, issues

					for (let ikey in data.rows){

						randpct = Math.floor((Math.random() * 100) + 1);
						issues  = Math.floor((Math.random() * 15) + 1);
						//let randpct2 = (100-randpct)y
						//taken out <td>${data.rows[ikey].id}</td>

						if(data.rows[ikey].subspecialty==null){
							subspecialty = ""
						}else{
							subspecialty = `, ${data.rows[ikey].subspecialty}`
						}//eif

						mytable += `
						<tr>
							<td colspan=4>
								<div style="display:block;font-weight:bold" class="text-primary">
									<div class="" style="display:inline-block">
										Dr. ${data.rows[ikey].full_name } 
										${subspecialty}
										</div>
								</div>
								<span style="color:#97BC62">${data.rows[ikey].expertise.replace(",","<br>") }</span><br>
								<span class='a4'>&nbsp;</span><br>
								<span class='a4'>&nbsp;</span>
								<br>
								
								<button type="button" onclick="javascript:util.toModalShow('calendarmodal','${data.rows[ikey].full_name}','${data.rows[ikey].xid}','');" class="btn btn-secondary" >
									<i class="fa fa-calendar"></i>&nbsp; Check Availability
								</button>
								
							</td>
							
						</tr>`
					}//=======end for
					
					
					let xprev = ((page-1)>0?'':'disabled')
					let xnext = ((page>=pages)?'disabled':'')
					let mypagination = "", main = "", xclass = ""
					//===mypagination is for pagination
					
					//===final pagination
					mypagination+=`
					<nav aria-label="Page navigation example">
					  <ul class="pagination">`
					
					//==== previous link
					mypagination += `<li class="page-item ${xprev}">
					<a class="page-link" href="javascript:zonked.getAllDoctors(${parseInt(req.params.page)-1 },'${req.params.expertise.toLowerCase()}')">Previous</a></li>`
					
					for(let x=0; x < pages; x++){
						
						if( req.params.page==(x+1)){
							xclass = "disabled"
						}else{
							xclass = ""
						}
						//==== number page
						mypagination += `<li class="page-item ${xclass}">
						<a class="page-link"  href="javascript:zonked.getAllDoctors(${x+1},'${req.params.expertise.toLowerCase()}')">${x+1}</a></li>`
						
					}//end for
					
					//=======next link
					mypagination += `<li class="page-item ${xnext}">
					<a class="page-link" href="javascript:zonked.getAllDoctors(${parseInt(req.params.page)+1},'${req.params.expertise.toLowerCase()}')">Next</a></li>`
					
					mypagination+=`
					</ul>
					</nav>`
					
					//=== if u add column in tables
					// === add also colspan=??
					mytable += `
						<tr>
						<td colspan=4 align='center'>
						 ${mypagination}<div id='reccount' style='visibility:hidden' >${reccount}</div>
						</td>
						</tr>
						</TBODY>
					</table>
					</div>`
					
					main +=`${mytable}`
							
					aPage.length = 0 //reset array
					
					closePg(db)

					res.send(main) //output result
				})//endquery
								
			}//eif 
		
		})//==end db.query 
		
	}).catch((error)=>{
		res.status(500).json({error:'No Fetch Docs'})
	})		

})//end pagination

//====check if remote file exists
const https = require ("https");
const { start } = require('repl')

// Set request options
router.get('/fileexist/:file',  async(req,res) => {
	console.log( 'fileexist file ', req.params.file )
	const xpath = `https://vantaztic.com/osndp/${req.params.file}`;
	console.log( 'fileexist path ', xpath )

	var options = { method: "HEAD", host: "vantaztic.com", path: `/osndp/${req.params.file}` };
	// Initialize HTTP request
	var request = https.request ( options, function ( response ) {
		console.log(response.statusCode)
		if(response.statusCode == "200"){
			res.json({status:true})
		}else{
			res.json({status:false})
		}
		
	});
	// End request
	request.end ();
 
})//====== END FILEEXISTS


//===========GET GCASH REF, AND FIND STATUS IF PAID ======//
router.get('/gcashref/:ref', async( req,res)=>{

	console.log('==CONTACTING gcashref()====', req.params.ref)
	fetcher(`https://api.paymongo.com/v1/links?reference_number=${req.params.ref}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json', authorization: 'Basic c2tfdGVzdF90a3FDZzlzempaQUQxOWNHRDczclpZMmQ6' }
	})    
	.then(resp => resp.json())
	.then(( json) => {
		console.log('===gcashref()', req.params.ref)
		
		if(req.params.ref==""){
			res.json({xdata:{status:'unpaid'}})
		}else{
			res.json({ xdata : json.data[0].attributes} )
		}
		
	})
	

})


  
module.exports = router;