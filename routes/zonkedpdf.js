const fs = require('fs');

//const PuppeteerHTMLPDF = require('puppeteer-html-pdf');
const pdf = require('html-pdf');
//const PassThrough = require('stream')
const hbar = require('handlebars');

//const QRCode = require('qrcode') 

//const boxview = require('chrome-launcher')
// const multer = require('multer')
const sharp = require('sharp')
const path = require('path');
const { DatabaseError } = require('pg');
//const ftpclient = require('scp2')


module.exports =  {
    tester: async(req, res) =>{
        console.log(req.params.tester)
        res.status(200).send('TESTER OK!')
    },

    reportpdf:(xdata, xdate)=>{
        return new Promise((resolve, reject)=> {
           
            //===================START CREATE PDF ======================//
            let htmlx = fs.readFileSync(path.join(__dirname, "report.html"

            ), "utf8")
            console.log('OPENING=== report.html*** ')

            //===== Vantaztic Logo========
            const bitmap = fs.readFileSync( path.join(__dirname, "zonked_logo.png") )
            const logo = bitmap.toString('base64');

            console.log(`CREATING REPORT PDF FILE===..`)
            //console.log('curent path is ', __dirname)
            
            let options = {
                format: "A4",
                orientation: "portrait",
                border: "5mm",
                header: {
                    height: "5mm"
                },
                footer: {
                    height: "9mm",
                    contents: {
                        first: '<span class="pagex">Page 1</span>',
                        2: '<span class="pagex">Page 2</span>',// Any page number is working. 1-based index
                        default: '<span class="pagex">{{page}}</span>/<span class="pagex">{{pages}}</span>', // fallback value
                        last: 'Last Page' 
                    }
                }
            }
            ///======================= DATA ============================/
            const pdfData = {
                xdates              :   xdate,
                logos		        :   logo,
                rptdata             :   xdata
            }
            //===================== END PDF DATA ========================//

            //=====apply handlebars formatting
            let template = hbar.compile(htmlx);
        
            let content = template(pdfData); // LET THE TEMPLATE HTML'S CONTENT EQUALS PDF DATA
            let contentx = template(pdfData);

            
            pdf.create( contentx, options ).toFile( `REPORT_${xdate}.pdf`,(err, res ) => {
                console.log( path.basename(res.filename), '==created' )

                if(res.filename){
                    resolve( path.basename(res.filename) )        
                }else{
                    reject(err)
                }
            })
            

           
        })//end return Promis

    },

    //=== CREATE MED RX =========
    medrxpdf:( req, xdate )=>{
        return new Promise((resolve, reject)=> {
            //===================START CREATE PDF ======================//
            const html = fs.readFileSync(path.join(__dirname, "medrx.html"), "utf8")
            console.log('OPENING=== medrx.html*** ')

            //===== Vantaztic Logo========
            const bitmap = fs.readFileSync( path.join(__dirname, "zonked_logo.png") )
            const logo = bitmap.toString('base64');

            console.log(`CREATING MEDRX PDF FILE===..`)
            
            let options = {
                format: "A4",
                orientation: "portrait",
                border: "5mm",
                header: {
                    height: "5mm"
                },
                footer: {
                    height: "9mm",
                    contents: {
                        first: '<span class="pagex">Page 1</span>',
                        2: '<span class="pagex">Page 2</span>',// Any page number is working. 1-based index
                        default: '<span class="pagex">{{page}}</span>/<span class="pagex">{{pages}}</span>', // fallback value
                        last: 'Last Page' 
                    }
                }
            }
            let aData = req.body.rx
            //console.log( aData )

            ///======================= DATA ============================/
            const pdfData = {
                xdates              :   xdate,
                logos		        :   logo,
                doctor_name         :   req.body.fdoctor.toUpperCase(),
                license             :   req.body.fdoclicense,
                patient             :   req.body.fpatient.toUpperCase(),
                medicine            :   aData
            }
            //===================== END PDF DATA ========================//

            //=====apply handlebars formatting
            let template = hbar.compile(html);

            let content = template(pdfData); // LET THE TEMPLATE HTML'S CONTENT EQUALS PDF DATA
            
            pdf.create( content, options ).toFile( `MEDRX_${req.body.fcaseno}.pdf`,(err, res ) => {
                console.log(  path.basename(res.filename) , '==created' )

                if(res.filename){
                    resolve( path.basename(res.filename ))        
                }else{
                    reject(err)
                }
            })


        })
    },
    
    ///=== CREATE MED CERT =============
    medcertpdf : ( req, xdate)=>{ 
        return new Promise((resolve, reject)=> {
           
            //===================START CREATE PDF ======================//
            let htmlx = fs.readFileSync(path.join(__dirname, "temp.html"

            ), "utf8")
            console.log('OPENING=== temp.html*** ')

            //===== Vantaztic Logo========
            const bitmap = fs.readFileSync( path.join(__dirname, "zonked_logo.png") )
            const logo = bitmap.toString('base64');

            console.log(`CREATING PDF FILE===..`)
            //console.log('curent path is ', __dirname)
            
            let options = {
                format: "A4",
                orientation: "portrait",
                border: "5mm",
                header: {
                    height: "5mm"
                },
                footer: {
                    height: "9mm",
                    contents: {
                        first: '<span class="pagex">Page 1</span>',
                        2: '<span class="pagex">Page 2</span>',// Any page number is working. 1-based index
                        default: '<span class="pagex">{{page}}</span>/<span class="pagex">{{pages}}</span>', // fallback value
                        last: 'Last Page' 
                    }
                }
            }
            ///======================= DATA ============================/
            const pdfData = {
                xdates              :   xdate,
                logos		        :   logo,
                license             :   req.body.fdoclicense,
                patient             :   req.body.fpatient,
                sickness            :   req.body.fdiagnose.toUpperCase(),
                sickness_summary    :   req.body.fsummary,
                restday             :   req.body.frest.toUpperCase(),
                doctor_name         :   req.body.fdoctor
            }
            //===================== END PDF DATA ========================//

            //=====apply handlebars formatting
            let template = hbar.compile(htmlx);
        
            let content = template(pdfData); // LET THE TEMPLATE HTML'S CONTENT EQUALS PDF DATA
            let contentx = template(pdfData);

            
            pdf.create( contentx, options ).toFile( `MEDCERT_${req.body.fcaseno}.pdf`,(err, res ) => {
                console.log( path.basename(res.filename), '==created' )

                if(res.filename){
                    resolve( path.basename(res.filename) )        
                }else{
                    reject(err)
                }
            })
            

            // //=========== CREATE PDF STREAM
            // pdf.create( content, options ).toStream( (err, stream ) => {
            //     let fstream= fs.createWriteStream(`MEDCERT_${req.body.fcaseno}.pdf`); //create stream
            //     stream.pipe( fstream )//write the stream

            //     console.log( 'Writing Stream... ', fstream.path )

            //     stream.resume()
            
            //     fstream.on('close', function (err) {
            //         if(fstream.path){
            //             resolve(fstream.path) //return true the promise
            //         }else{
            //             reject(err)
            //         }//eif
                
            //     })//end fstream onclose
            // })//====end create PDF
            // //==================END CREATE PDF================//
                
        })//end return Promise

    }//=======end object medcert pdf()
}//======end module export 
