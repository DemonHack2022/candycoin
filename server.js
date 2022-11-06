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
 

router.get('/studentlogin', (req,res) => {
	res.render('studentlogin')
})

router.post('/studentlogin', (req,res) => {
	student = true;  
	current_username = req.body.username;
	
	if(req.body.action && req.body.action == 'login'){  
			 pool.query(`SELECT * FROM Student WHERE username = '${req.body.username}'`, (err,result) => {
				console.log(err,result)   
				if(result.rows.length > 0){
					var password = result.rows[0].password
						
					if(  bcrypt.compareSync(req.body.password, password) ){
						console.log(result)
						res.redirect('/studentpanel')
					}else{ 
						//res.redirect('/invalid') 
						console.log(req)
				}
			}
				}); 
			}
	
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

router.post('/adminsignup' , async (req,res) => {
	
	if( !req.body.tid || !req.body.username || !req.body.password || !req.body.firstName || !req.body.lastName || !req.body.email){
		
		res.redirect('/adminsignuperror')
	}else{
	 
	  const hp = await bcrypt.hash(req.body.password, 10)
	  const zero = 0;
	  const empty = "";    
	  var addTeacher = `INSERT INTO Teacher(teacherID,username,password,firstName,lastName,email)
		VALUES ( '${req.body.tid}', '${req.body.username}', '${hp}', '${req.body.firstName}', '${req.body.lastName}',  '${req.body.email}' )`
	  
	  current_username = req.body.username;  
	  
	 pool.query(addTeacher, (err,result) => {
			if( !result ) { 
				console.log(err,result)
				return } 
				console.log(err,result) 
			res.redirect('/adminlogin')
	 })  
	  
	}
})

router.get('/adminlogin', (req,res) => {
	res.render('adminlogin')
	
})

router.post('/adminlogin' , (req,res) => {
	student = false; 
	current_username = req.body.username;
	if(req.body.action && req.body.action == 'login'){  
			 pool.query(`SELECT * FROM Teacher WHERE username = '${req.body.username}'`, (err,result) => {
				console.log(err,result)   
				if(result.rows.length > 0){
					var password = result.rows[0].password
						
					if(  bcrypt.compareSync(req.body.password, password) ){
						console.log(result)
						res.redirect('/adminpanel')
					}else{
						
						//res.redirect('/invalid') 
						console.log(req)
				}
			}
				}); 
			}
	
	
})

router.get('/adminpanel', (req,res) => {
	pool.query(`SELECT * FROM Candy`, (err,candies_results) => {
			console.log(err, candies_results)
            res.render('adminpanel', {  
                     candies: candies_results.rows
			}); 
	}); 
})


router.post('/adminpanel', (req,res) => {
	 
})

router.get('/studentpanel', (req,res) => {
	pool.query(`SELECT * FROM Candy`, (err,candies_results) => {
			console.log(err, candies_results)
            res.render('studentpanel', {  
                     candies: candies_results.rows
			}); 
	}); 
})


router.post('/studentpanel', (req,res) => {
	 
})



router.get('/adminsignuperror' , (req,res) => {
	res.render('adminsignuperror')
	
})

router.post('/adminsignuperror', (req,res) => {
	if( req.body.action && req.body.action == 'try again' ){ 
		  res.redirect('/adminsignup')
	} 
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
	  var addStudent = `INSERT INTO Student(studentID,username,password,firstName,lastName,email,coinAmount)
		VALUES ( '${req.body.sid}', '${req.body.username}', '${hp}', '${req.body.firstName}', '${req.body.lastName}',  '${req.body.email}', '${zero}' )`
	  studentID = req.body.sid; 
	  
	  current_username = req.body.username;  
	  
	 pool.query(addStudent, (err,result) => {
			if( !result ) { 
				console.log(err,result)
				return } 
				console.log(err,result) 
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
