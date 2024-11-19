 //get express js
const express = require('express')
const app = express()
const fs = require('fs');

const bodyParser = require('body-parser')

//======== for db connection
const { connectPg, closePg }  = require('./db')

connectPg() 
.then((pg)=>{
    console.log("====INDEX.JS ZONKED POSTGRESQL CONNECTION SUCCESS!====")
    closePg(pg);
  })                        
  .catch((error)=>{
      console.log("***ERROR, CAN'T CONNECT TO POSTGRESQL DB!****",error.code)
  });  


const http = require('http')
///const https = require('https')


 //===== for socket.io
//  const key = fs.readFileSync('cert.key');
//  const cert = fs.readFileSync('cert.crt');

//// bring back if local server_https = https.createServer( {key, cert}, app);
const server_https = http.createServer( app);
     
const io = require("socket.io")( server_https, {
    cors: {
        methods: ["GET", "POST"],
        allowedHeaders: ["osndp-header"],
        credentials: true
    }
})
      
const path = require('path')

//=======================
//important, tell express that the data returned is json
app.use(express.json()) 
app.use(express.urlencoded({extended:true}))

// to support URL-encoded bodies
app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({extended:false}))
 
//=== this is !important for CORS especially for different servers calling====//
const allowedOrigins = "*"

// ["https://osndp.vantaztic.com",  "http://localhost:4004",
//                         "http://192.168.184.140:8000",    "http://localhost:8000",
//                         "http://localhost:4002", "http://localhost:4005",
//                         "http://192.168.175.140:4004",  "http://127.0.0.1:5500"]

app.use(function(req, res, next) {
    let origin = req.headers.origin;

    console.log( 'THIS IS THE ORIGIN', req.headers.origin)
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin); // restrict it to the required domain
    }

    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
   
});

const getRandomPin = (chars, len)=>[...Array(len)].map(
    (i)=>chars[Math.floor(Math.random()*chars.length)]
 ).join('');
 
//======== END NODEJS CORS SETTING
app.get('/test',(req, res)=>{
    const apitest = getRandomPin('0123456789',6)
    console.log(apitest, ' API Ready to Serve')
    res.status(200).send(`${apitest} API ready to serve!`)
    //res.sendFile(path.join(__dirname , 'index.html'))
})

//==========ALL ABOUT COOKIE =============
const cookieParser = require('cookie-parser');
app.use(cookieParser())

app.get("/cookie1", (req, res) => {
    /*
	res
	  .writeHead(200, {
		"Set-Cookie": "xtoken=poknaters; HttpOnly",
		"Access-Control-Allow-Credentials": "true"
	  })
	  .send();
    */
      res.cookie('parser', 'test', {maxAge: 900000, httpOnly: true});
      res.send('Check your cookies. One should be in there now');
});
  
app.get("/cookie2", (req, res) => {
	
    console.log('cookies',req.cookies['parser'])
	//if (!req.cookies) return res.status(401).send('error ka');
	res.status(200).json({ secret: "Ginger ale is a specific Root Beer" });
});
//===local routing
/*
app.get('/',(req, res)=>{
    res.send('API ready to serve!')
    //res.sendFile(path.join(__dirname , 'index.html'))
})

app.get('/test',(req, res)=>{
    res.send(`Enuff with the test it's working fine!`)
    //res.sendFile(path.join(__dirname , 'index.html'))
})
*/

//===============Main Routes
const usersRouter = require('./routes/api');
app.use('/', usersRouter);

const bgcRouter = require('./routes/bgc')
app.use('/bgc', bgcRouter)

const asianowRouter = require('./routes/asianow')
app.use('/asia', asianowRouter)

//===== socket.io connect
let listClient = []

const offers = [
    // offererUserName
    // offer
    // offerIceCandidates
    // answererUserName
    // answer
    // answererIceCandidates
];

let connectedSockets = [
    //username, socketId
]
 
let nLogged = 0
let xmsg
let userMode, userName

//listen socket.io
io.on('connection', (socket) => {

	if(socket.handshake.query.userName){
		const userNames = socket.handshake.query.userName
		const userNamex = JSON.parse(userNames)
		userName = userNamex.token
		
		userMode = userNamex.mode
		console.log('mode==', userMode)
				
		connectedSockets.push({
            socketId: socket.id,
            mode: userMode,
            userName
		})		
				
		nLogged++
				
		console.log('*** PROJECT ZONKED SOCKET.IO SERVICES STARTED ***\n', connectedSockets)	
		
		console.log(`Zonked connected ${nLogged}`)
				
		if(userMode==2){
			//console.log('*** PROJECT ZONKED SOCKET.IO SERVICES STARTED ***\n', connectedSockets)	
	
			socket.on('paidgcash', (data) => {
				let xdata = JSON.parse( data )
		 
				console.log('paidcash', xdata.doctor, connectedSockets)
				
				const finder = connectedSockets.findIndex( x => x.userName === xdata.doctor && x.mode==2)
				
				console.log(finder)

				if(finder >= 0){ //if found
					//give message to the intended client
					socket.to( connectedSockets[finder].socketId).emit('paidalready', data )
				}

				if(finder ==-1){
					//if intended client not connected, send back message to user sender
					socket.emit('noconnect', data)
				}
			})//end listener	
		}//==eif
		
	}//============eif
	
	
	//=== GCASH ==============
	if(socket.handshake.query.gCash){
		
		let xmode = JSON.parse(socket.handshake.query.gCash)
		
		userMode = xmode.mode
		
		console.log( '===GCASH===', JSON.parse(socket.handshake.query.gCash) )
		
	}//eif
	//====== END GCASH ====//
	
    socket.on('offer', (msg) =>{
        console.log('offer')
        let nick = JSON.parse(msg)
        xmsg = msg
        io.emit('answer', xmsg)

    })

    socket.on('reply', (msg) =>{
        //console.log(msg)
        xmsg = msg
        io.emit('replied', xmsg)

    })
	
    socket.on('dial', (data)=> {
        console.log('dialled.',data)
        let xdata = JSON.parse( data )
 
        const finder = connectedSockets.findIndex( x => x.userName === xdata.doctor)
        //console.log(finder)

        if(finder >= 0){ //if found
            //give message to the intended client
            socket.to( connectedSockets[finder].socketId).emit('answered', data )
        }

        if(finder ==-1){
            //if intended client not connected, send back message to user sender
            socket.emit('noconnect', data)
        }
        //io.emit('answered', data)
    })

    socket.on('confirm', (data)=>{
        let xdata = JSON.parse( data )

        //locate patient to confirm
        const finder = connectedSockets.findIndex( x => x.userName === xdata.patient)
        //console.log(finder)

        if(finder >= 0){ //if found
            //give message to the intended client
            xdata.type = "client"
            socket.to( connectedSockets[finder].socketId).emit('confirmed', ( JSON.stringify(xdata)) )
        }

        xdata.type ="doctor"
        //locate THE doctor who confirmd
        socket.emit('confirmed', ( JSON.stringify(xdata)) )
    
    })
    socket.on('decline', (data)=>{
        let xdata = JSON.parse( data )

        //locate patient to confirm
        const finder = connectedSockets.findIndex( x => x.userName === xdata.patient)
        //console.log(finder)

        if(finder >= 0){ //if found
            //give message to the intended client
            socket.to( connectedSockets[finder].socketId).emit('declined', ( JSON.stringify(xdata)) )
        }
    })

    
    //if user disconnect
    socket.on('disconnect', (id) => {
		console.log('disconnecting....')
			
		nLogged--
		
        const togo = connectedSockets.findIndex( x => x.socketId === socket.id)
        
        connectedSockets.splice(togo, 1 )

        console.log( connectedSockets)

        console.log(` Zonked connected ${nLogged}`)
        //io.emit('logged',`Zonked connected: ${nLogged }`)
    })

})


//====== server listen to por

const port = process.env.PORT||10000

server_https.listen( port ,()=>{
    console.log(`https listening to port ${port}`)
})
