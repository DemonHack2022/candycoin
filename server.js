const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000
const router = express.Router();
const path = require('path') 
const pg = require('pg')
const bcrypt = require('bcrypt')  

//Set location for accessing files
app.use(express.static(path.join(__dirname, 'public')));

//Set the view engine for the express app  
app.set("view engine", "pug")
var current_username = ""; 
var student = true; 
var studentID;

//for parsing application/json
app.use(bodyParser.json());
app.use(express.json())

//for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended:true }));
//form-urlencoded

const Pool = require('pg').Pool

var connectionParams =  null;
if (process.env.DATABASE_URL != null){
    connectionParams = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    } 
}

   else{
   connectionParams = {
		user: 'dh1',
		host: 'localhost',
		database: 'dh',
		password: '12345',
		port: 5432, 
	}
}


console.log(connectionParams)
const pool = new pg.Client(connectionParams)

pool.connect(err => {
    //if (err) throw err; 
});
 
  

router.get('/', (req, res) => {
  res.render('index', { title: 'CandyCoin' });
})

	
 
router.post('/',
		(req,res) => {
		
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			return res.status(400).send({ errors: errors.array() });
		} 
		res.redirect('/')

}) 


router.get('/invalid', (req,res) => {
	res.render('invalidlogin')
	
})

router.post('/invalid', (req,res) => { 
	if(realtor){
		res.redirect('/realtorlogin')
	}else{
		res.redirect('/customerlogin')
	}
	
})
 
router.get('/login' , (req,res) => {
	res.render('index') 
})

router.post('/login' , (req,res) => {
	if(req.body.action && req.body.action == 'student') {
		res.redirect('/studentlogin')
	}	
	if(req.body.action && req.body.action == 'admin') {
		res.redirect('/adminlogin')
	}	
	if(req.body.action && req.body.action == 'register') {
		res.redirect('/register')
	}
	 
})

router.get('/adminlogin', (req,res) => {
	res.render('adminlogin')
})

router.post('/adminlogin', (req,res) => {

})

router.get('/studentlogin', (req,res) => {
	res.render('studentlogin')
})

router.post('/studentlogin', (req,res) => {

})



router.get('/register', (req,res) => { 
	res.render('register')
}) 

router.post('/register', (req,res) => {
	if(req.body.action && req.body.action == 'student'){
		realtor = false;
		res.redirect('/studentsignup') 
		
	}
	if(req.body.action && req.body.action == 'admin'){
		realtor = true;
		res.redirect('/adminsignup')
	}
})


router.get('/adminsignup',  (req,res) => {
	res.render('adminsignup')

})
router.get('/studentsignup',  (req,res) => {
	res.render('studentsignup')

})

router.post('/studentsignup' ,   async (req,res) => {
	
	
	if( !req.body.sid || !req.body.username || !req.body.password || !req.body.firstName || !req.body.lastName || !req.body.email){
		
		res.redirect('/studentsignuperror')
	}else{
	 
	  const hp = await bcrypt.hash(req.body.password, 10)
	  const zero = 0;
	  const empty = "";   
	  var addCBag = `INSERT INTO ChildBag(CID,CandyName,CandyAmount,CandyPrice)
			VALUES( '${req.body.sid}' , '${empty}', '${zero}', '${zero}' )`
	  var addChild = `INSERT INTO Child(studentID,username,password,firstName,lastName,email)
		VALUES( '${req.body.sid}', '${req.body.username}', '${hp}', '${req.body.firstName}', '${req.body.lastName}',  '${req.body.email}' )`
	  studentID = req.body.sid;
	  current_username = req.body.username;  
	  
	 pool.query(addCBag, (err,result) => {
			if( !result ) { return } 
				console.log(err,result) 
	 }) 
	 
	 pool.query(addChild ,(err,result) => { 
					console.log(studentID);
					 res.redirect('/studentlogin')
		})
	}
	
})

router.get('/studentsignuperror' , (req,res) => {
	res.render('studentsignuperror')
	
})

router.post('/studentsignuperror', (req,res) => {
	if( req.body.action && req.body.action == 'try again' ){ 
		  res.redirect('/studentsignup')
	} 
})



app.use('/',router);
module.exports = app
