var express=require('express')
var path=require('path')
const multer = require('multer');
var app=express()
var ejs=require('ejs')
var session = require('express-session');
const fs=require('fs')
const nodemailer = require("nodemailer");
 var passport=require('passport')
app.use(passport.initialize());
app.use(passport.session());
var GitHubStrategy = require('passport-github').Strategy;

app.use(express.static(path.join(__dirname, 'public')));
//Bodyparser
app.use(express.urlencoded({extended: true})); 
app.use(express.json());
app.use(session({secret: "SecretLogin"}));

const viewsPath = path.join(__dirname, 'template/views');
const partialsPath = path.join(__dirname, 'template/partial');
app.set('view engine', 'ejs');
app.set('views', viewsPath);
//ejs.registerPartials(partialsPath);

var mongoose = require('mongoose');
var mongoDB = 'mongodb://localhost/Project';
mongoose.connect(mongoDB);
mongoose.connection.on('error', (err) => {
    console.log('DB connection Error');
});
mongoose.connection.on('connected', (err) => {
    console.log('DB connected');
});



var communitySchema=new mongoose.Schema({
    Name:String,
    Status:String,
    Owner:String,
    Rule:String,
    Date:String,
    Location:String,
    Description:String,
    Requested:[String],
    Members:[String],
    final : {
      contentType: String,
     path : String
     }     
})
var community=mongoose.model('comms',communitySchema);
var UserSchema = new mongoose.Schema({
    Email :String,
    Name:String,
    DOB :String,
    Gender :String,
    Phone : Number,
    City : String,
    Password : String,
    Role:String,
    Status:String,
    Flag:Number,
    
    Joinedid:[String],
    Communitiesid:[String],
 	final : {
      contentType: String,
     path : String
   }    //category : [{ 'abd': Number , }]
  })
var user =  mongoose.model('users', UserSchema);
var TagSchema = new mongoose.Schema({
    Name:String,
    By:String,
	Date:String
  })

var tag=  mongoose.model('tags', TagSchema);
const myurl = 'mongodb://localhost/Project';
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(myurl, (err, client) => {
  if (err) return console.log(err)
  db = client.db('users') 
})

app.get('/',function(req,res){
	//access=0;
	
		res.render('index',{
			
		})
	
})

app.get('/login',function(req,res){
	//access=0;
	req.session.isLogin=0;
		res.render('index',{
		})

})

app.put('/password',function(req,res){
    user.findOneAndUpdate(
    {
        Email: req.body.Email,
        Password:req.body.Password// search query
    },
        {
      Password:req.body.newPassword// field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
        res.send("UPDATED")
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})

app.post('/userlogin',function(req,res){
	user.find({
		Email:req.body.email,
		Password:req.body.password 
	})
	.then(data=>{
		if(data[0].Flag){
			res.send("Invalid");
		}
		if(data.length!=0){
			req.session.ID=data[0]._id;
			req.session.isLogin=1;
			req.session.toUser=0;
			req.session.Email=data[0].Email;
			req.session.Role=data[0].Role;
			console.log(data[0]._id);
			
			res.send("successfully signed in")
		}
	})
	.catch(err =>{
		res.send("INVALID Email/Password")
	})
})

app.post('/findUser',function(req,res){
	user.find({
		Email:req.body.Email
	})
	.then(data => {
          res.send(data)
        })
    .catch(err => {
          console.error(err)
          res.send(error)
        })
})

app.get('/portal/:id',function(req,res){
	if(req.session.isLogin){
		res.render('portal',{
			user:req.session
		})
	}
	else
		res.render('index',{
			
		})
})


app.get('/edit/:id',function(req,res){
	if(req.session.isLogin){
		res.render('edituser',{
			user:req.session
		})
	}
	else
		res.render('index',{
			
		})
})

app.get('/memberspage/:id/:user',function(req,res){
	if(req.session.isLogin){
		res.render('members',{
			user:req.session
		})
	}
	else
		res.render('index',{
			
		})
})

app.get('/currentSession',function(req,res){
     user.find({
           // search query
           //userName: 'mlbTvrndc'  
      })
      .then(data => {
         console.log(req.session)
          res.send(req.session)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
})

app.get('/findById/:id',function(req,res){
	user.find({
		_id:req.params.id
	})
	.then(data => {
		
          res.send(data)
        })
        .catch(err => {
          res.send(error)
        })
})

app.get('/comms/mycreated',function(req,res){
	community.find({
		Owner:req.session.Email
	})
	.then(data => {
		console.log(data)
          res.send(data)
        })
    .catch(err => {
          res.send(error)
        })
})

app.get('/home/:id',function(req,res){
	if(req.session.isLogin){
		res.render('home',{
			user:req.session
			
		})
	}
	else
		res.render('index',{
			
		})
})
app.get('/changepassword/:id',function(req,res){
	if(req.session.isLogin){
		res.render('password',{
			user:req.session
		})
	}
	else
		res.render('index',{
			
		})
})
// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
});

//Acces static files
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

 app.post('/uploadphoto', upload.single('myImage'),(req, res) => {
     if(!req.file)
         res.render('update1');
 else{
    var img = fs.readFileSync(req.file.path);
 var encode_image = img.toString('base64');
 // Define a JSONobject for the image attributes for saving to database

  var finalImg = {
      path:req.file.path,
      contentType: req.file.mimetype,
   }
  user.findOneAndUpdate(
      {
      Email:req.session.Email
  },
                           {
                               final:finalImg
                           })
    .then(data => {
      console.log(data);
    res.redirect(`/home/${req.session.ID}`)
        })
        .catch(err => {
          console.error(err)
    res.redirect(`/home/${req.session.ID}`)
        })

 }
  })

app.get('/getphoto/:id', (req, res) => {
    console.log(req.session)
	user.findOne({
    _id:req.params.id
})
       .then(data => {
       res.contentType('image/jpeg');
          res.send(data.final.path)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
});

app.get('/getcommphoto/:id', (req, res) => {
    console.log(req.session)
	community.findOne({
    _id:req.params.id
})
       .then(data => {
       res.contentType('image/jpeg');
          res.send(data.final.path)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
});

app.post('/updateuser',function(req,res){
	user.findOneAndUpdate(
    {
        Email: req.body.Email  // search query
    },
        {
      		Phone:req.body.phno,
            City:req.body.city,
            Role:req.body.role,
            Status:req.body.status,
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
        res.redirect(`/listusers/${req.session.ID}`)
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})
app.put('/update',function(req,res){
    user.findOneAndUpdate(
    {
        Email: req.body.Email  // search query
    },
        {
			DOB:req.body.DOB,
      		Phone:req.body.Phone,
            Gender:req.body.Gender,
            City:req.body.City,
            Role:req.body.Role,
            Status:req.body.Status,
			Name:req.body.Name// field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
        res.send("UPDATED")
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})

app.post('/updatecomm/:id',function(req,res){
	console.log("AA");
    community.findOneAndUpdate(
    {
        _id:req.params.id  // search query
    },
        {
			Name: req.body.commname,
      Status: req.body.status,
			// field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
        res.redirect(`/listcomms/${req.session.ID}`)
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})
app.post('/disableuser',function(req,res){
    user.findOneAndUpdate(
    {
        Email: req.body.Email  // search query
    },
        {
			Flag:'1'// field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
        res.send("UPDATED")
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})
app.post('/enableuser',function(req,res){
    user.findOneAndUpdate(
    {
        Email: req.body.Email  // search query
    },
        {
			Flag:'0'// field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
        res.send("UPDATED")
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})
app.get('/addUser/:id',(req,res)=>{
    if(req.session.isLogin)
        {
    res.render('adduser',{
		user:req.session
    })
        }
    else
        {
            res.render('index');
        }
})
app.get('/switchtoUser',(req,res)=>{
    if(req.session.isLogin)
        {
			req.session.toUser=1;
    res.redirect(`/home/${req.session.ID}`)
        }
    else
        {
            res.render('index');
        }
})
app.get('/switchtoAdmin',(req,res)=>{
    if(req.session.isLogin)
        {
			req.session.toUser=0;
    res.redirect(`/home/${req.session.ID}`)
        }
    else
        {
            res.render('index');
        }
})
app.get('/listusers/:id',(req,res)=>{
    if(req.session.isLogin)
        {
    res.render('userlist',{
		user:req.session
    })
        }
    else
        {
            res.render('index');
        }
})
app.get('/listtags/:id',(req,res)=>{
    if(req.session.isLogin)
        {
    res.render('taglist',{
		user:req.session
    })
        }
    else
        {
            res.render('index');
        }
})
app.get('/listcomms/:id',(req,res)=>{
    if(req.session.isLogin)
        {
    res.render('communitylist',{
		user:req.session
    })
        }
    else
        {
            res.render('index');
        }
})

app.post('/add',function(req,res){
console.log(req.body)
    let   newuser=new user({
                      Name:req.body.name,
                      Email:req.body.email,
               Password:req.body.pass,
               City:req.body.city,
               DOB:req.body.dob,
               Gender:req.body.gender,
               Phone:req.body.phone,
            Role:req.body.role,
            Status:req.body.status,
        Flag:'0'
                  })  
           user.find({Email:req.body.email})

      .then(data => {
          if(data.length==0)
              {
               newuser.save()
                  res.send("ADDED");
              }
          else{
          console.log(data)
          res.send("Already added")
          }
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  })

app.post('/addtag',function(req,res){
console.log(req.body)
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	date=date.toString();
	
    let   newtag=new tag({
                      Name:req.body.tagname,
						By:req.session.Email,
						Date:date
                  })  
           tag.find({Name:req.body.tagname})

      .then(data => {
          if(data.length==0)
              {
               newtag.save()
                  res.send("Added");
              }
          else{
          console.log(data)
          res.send("Already added")
          }
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  })


app.post('/mail',function(req,res){
    var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
//      clientId:'354116386100-bgfhvd9n4fss1fck3vdo0gs7ot9aifus.apps.googleusercontent.com',
       type: "login",
        user: 'khyati15khanduja@gmail.com',
      pass:'Khyatikk1511'
//        clientSecret: 'XXWFS_-G8GIZd_CJMBIcrdci',
//        refreshToken: '1/XXxXxsss-xxxXXXXXxXxx0XXXxxXXx0x00xxx',
//        accessToken: 'ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x'
  }
});
    var mailOptions = {
  from: 'khyati15khanduja@gmail.com',
  to: req.body.sendTo,
  subject: req.body.subject,
  text: req.body.matter
};
    transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
      res.send("Error")
  } else {
    console.log('Email sent: ' + info.response);
      res.send("Mailed")
  }
});
})

app.post('/getuserlist',function(req,res){
	if(!req.session.isLogin){
		res.render('index',{})
	}
	else{
		var count;
		count = user.countDocuments({}, function (error, c) {
      count = c;
    });
		console.log(req.body)
		var findobj={};
		var querystatus=req.body.querystatus;
		var queryrole=req.body.queryrole;
		var searchval=req.body.search.value;
		if(querystatus==0 && queryrole==0){
			user.find({}, {
          "_id": 0
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
				
				if(searchval!=''){
					var getcount=10;
					console.log(searchval)
//					findobj=Object.assign({},data);
					findobj["$or"]=[{
						"Email":{'$regex':searchval,
								'$options':'i'},
					},{
						"City":{'$regex':searchval,
								'$options':'i'},
					},{
						"Status":{'$regex':searchval,
								'$options':'i'},
					},
						{
						"Role":{'$regex':searchval,
								'$options':'i'},
					}
					]
				console.log(findobj)
				user.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)
					
					user.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}
			
				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
        .catch(err => {
          console.error(err)
          res.send(err);
        })
		}
	else if (querystatus == 0 && queryrole != 0) {
      user.find({
          "Role": queryrole,
        }, {
          "_id": 0
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
          if(searchval!=''){
					var getcount=10;
					console.log(searchval)
//					findobj=Object.assign({},data);
			  findobj.Role=queryrole;
					findobj["$or"]=[{
						"Email":{'$regex':searchval,
								'$options':'i'},
					},{
						"City":{'$regex':searchval,
								'$options':'i'},
					},{
						"Status":{'$regex':searchval,
								'$options':'i'},
					},
						{
						"Role":{'$regex':searchval,
								'$options':'i'},
					}
					]
				console.log(findobj)
				user.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)
					
					user.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}
			
				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
        .catch(err => {
          console.error(err)
          res.send(err);
        })
    } else if (querystatus != 0 && queryrole == 0) {
      user.find({
          "Status": querystatus,
        }, {
          "_id": 0
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
          if(searchval!=''){
					var getcount=10;
					console.log(searchval)
			  findobj.Status=querystatus;
//					findobj=Object.assign({},data);
					findobj["$or"]=[{
						"Email":{'$regex':searchval,
								'$options':'i'},
					},{
						"City":{'$regex':searchval,
								'$options':'i'},
					},{
						"Status":{'$regex':searchval,
								'$options':'i'},
					},
						{
						"Role":{'$regex':searchval,
								'$options':'i'},
					}
					]
				console.log(findobj)
				user.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)
					
					user.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}
			
				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
    } else {
      user.find({
          "Status": querystatus,
          "Role": queryrole,
        }, {
          "_id": 0
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
         if(searchval!=''){
					var getcount=10;
					console.log(searchval)
//					findobj=Object.assign({},data);
			 findobj.Status=querystatus;
			 findobj.Role=queryrole;
					findobj["$or"]=[{
						"Email":{'$regex':searchval,
								'$options':'i'},
					},{
						"City":{'$regex':searchval,
								'$options':'i'},
					},{
						"Status":{'$regex':searchval,
								'$options':'i'},
					},
						{
						"Role":{'$regex':searchval,
								'$options':'i'},
					}
					]
				console.log(findobj)
				user.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)
					
					user.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}
			
				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
    }
  }
});



app.post('/gettagslist',function(req,res){
	if(!req.session.isLogin){
		res.render('index',{})
	}
	else{
		var count;
		count = tag.countDocuments({}, function (error, c) {
      count = c;
    });
		console.log(req.body)
		var findobj={};
				var searchval=req.body.search.value;

			tag.find({}, {
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
				
				if(searchval!=''){
					var getcount=10;
					console.log(searchval)
//					findobj=Object.assign({},data);
					findobj["$or"]=[{
						"Name":{'$regex':searchval,
								'$options':'i'},
					},{
						"By":{'$regex':searchval,
								'$options':'i'},
					}
					
					]
				console.log(findobj)
				tag.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)
					
					tag.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}
			
				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
        .catch(err => {
          console.error(err)
          res.send(err);
        })
	}
		
});
app.post('/getcommslist',function(req,res){
	if(!req.session.isLogin){
		res.render('index',{})
	}
	else{
		var count;
		count = community.countDocuments({}, function (error, c) {
      count = c;
    });
		console.log(req.body)
		var findobj={};
		var querystatus=req.body.querypermission;
				var searchval=req.body.search.value;

		if(querystatus==0){
			community.find({}, {
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
				
				if(searchval!=''){
					var getcount=10;
					console.log(searchval)
//					findobj=Object.assign({},data);
					findobj["$or"]=[{
						"Name":{'$regex':searchval,
								'$options':'i'},
					},{
						"Rule":{'$regex':searchval,
								'$options':'i'},
					},{
						"Location":{'$regex':searchval,
								'$options':'i'},
					},
						{
						"Owner":{'$regex':searchval,
								'$options':'i'},
					}
					]
				console.log(findobj)
				community.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)
					
					community.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}
			
				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
        .catch(err => {
          console.error(err)
          res.send(err);
        })
		}
	
		else if (querystatus != 0) {
      community.find({
          "Rule": querystatus,
        }, {
          "_id": 0
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
          if(searchval!=''){
					var getcount=10;
					console.log(searchval)
			  findobj.Rule=querystatus;
//					findobj=Object.assign({},data);
					findobj["$or"]=[{
						"Name":{'$regex':searchval,
								'$options':'i'},
					},{
						"Rule":{'$regex':searchval,
								'$options':'i'},
					},{
						"Location":{'$regex':searchval,
								'$options':'i'},
					},
						{
						"Owner":{'$regex':searchval,
								'$options':'i'},
					}
					]
				console.log(findobj)
				community.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)
					
					community.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}
			
				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
    }
		
  }
});

app.get('/comminfo/:id',function(req,res){
	community.find({
		_id:req.params.id
	})
	.then(data => {
          res.send(data)
        })
    .catch(err => {
          console.error(err)
          res.send(error)
        })
})
app.get('/tags/:id',(req,res)=>{
    if(req.session.isLogin)
        {
    res.render('createtag',{
		user:req.session
    })
        }
    else
        {
            res.render('index');
        }
})
app.get('/createcomm/:id',function(req,res){
	if(req.session.isLogin)
        {
    res.render('createcomm',{
		user:req.session
    })
        }
    else
        {
            res.render('index');
        }
})

app.get('/commpanel/:id',(req,res)=>{
    if(req.session.isLogin)
        {
    res.render('commpanel',{
		user:req.session
    })
        }
    else
        {
            res.render('index');
        }
})
app.get('/searchcomms/:id',(req,res)=>{
    if(req.session.isLogin)
        {
    res.render('searchcomm',{
		user:req.session
    })
        }
    else
        {
            res.render('index');
        }
})
app.post('/deletetag',function(req,res){
	tag.remove({
		Name:req.body.Name
	})
		.then(data => {
          res.send('Deleted Successfully')
        })
    .catch(err => {
          console.error(err)
          res.send(error)
        })
})

app.post('/comms/joined', function (req, res) {
  community.find({
      "Members": {
        $eq: req.session.ID
      },
      "Requested": {
        $ne: req.session.ID
      },
      "Owner": {
        $ne: req.session.Email
      },
    }).sort({
      "Name": 1
    })
    .then(data => {
      // console.log("inside iampartof");
      // console.log(data);
      res.send(data);
    })
    .catch(err => {
      console.error(err)
      res.send(err);
    })
});
app.post('/AddCommunity', upload.single('community-'), function (req, res) {
  console.log(req.body);
  console.log(req.file);

     
        var finalImg;
        if (req.file) {
            finalImg = {
      path:req.file.path,
      contentType: req.file.mimetype,
   }
        } else {
            finalImg = {
      path:"./public/uploads/community.jpg",
   }
        }
        var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	date=date.toString();
        let newcomm = new community({
          Name: req.body.communityName,
          final: finalImg,
          Owner: req.session.Email,
          Rule: req.body.communityMembershipRule,
          Description: req.body.description,
          Members: [req.session.ID],
          Status: "Deactive",
		  Location:"Not Added",
          Date: date,
        });
        newcomm.save()
          .then(data => {
			console.log(data)
			user.findOneAndUpdate({
				_id:req.session.ID
			},{
				$push:{
					Communitiesid:data._id,
					Joinedid:data._id
				}
			},{safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }else{
        //do stuff
            res.redirect(`/commpanel/${req.session.ID}`);
        }
    }

);
          })
          .catch(err => {
            console.error(err)
            res.send(error)
          })
      
});


app.post('/comms/requested', function (req, res) {
  community.find({
      "Members": {
        $ne: req.session.ID
      },
      "Requested": {
        $eq: req.session.ID
      },
      "Owner": {
        $ne: req.session.Email
      },
    }).sort({
      "Name": 1
    })
    .then(data => {
      // console.log("inside iampartof");
      // console.log(data);
      res.send(data);
    })
    .catch(err => {
      console.error(err)
      res.send(err);
    })
});
passport.serializeUser(function(user, done) {
  done(null, user);
});


passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(new GitHubStrategy({
    clientID: 'b83bad3767b6e2a41691',
    clientSecret: '635f52fc3deea200879dfa0dbe5687a954d1b707',
    callbackURL: "http://localhost:3000/auth/github/callback",
	session : true
  },
  
  function(accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    })
  );
app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login'
  }),
  function (req, res) {
    console.log("githubsignin succesful");
console.log(req.session.passport);
    //console.log(temp);
    user.find({
      Email: req.session.passport.user._json.email
    })
    .then(data => {
  req.session.isLogin = 1;
                    req.session.ID=data[0]._id;
			req.session.isLogin=1;
			req.session.toUser=0;
			req.session.Email=data[0].Email;
			req.session.Role=data[0].Role;
			console.log(data[0]._id);
			if(data[0].Status=="Confirmed")
                     res.redirect(`/portal/${req.session.ID}`);
			else
					res.redirect(`/edit/${req.session.ID}`);
			//console.log("added");
    })
    .catch(err => {
      console.error(err);
        res.redirect('/login')
      //res.send(error)
    });
   
    //res.send('Github login successful');
  });
 app.post('/searchcomm', function (req, res) {
  community.find({
      "Owner": {
        $ne: req.session.Email
      },
      "Members": {
        $ne: req.session.ID
      },
      "Requested": {
        $ne: req.session.ID
      },
    }).sort({
      "name": 1
    })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.error(err)
      res.send(err);
    })
});
 app.post('/searchcommwithval', function (req, res) {
  community.find({
      "Owner": {
        $ne: req.session.Email
      },
      "Members": {
        $ne: req.session.ID
      },
      "Requested": {
        $ne: req.session.ID
      },
	  "Name":{
		  $regex:req.body.value,
		  $options:'i'
	  }
    }).sort({
      "name": 1
    })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.error(err)
      res.send(err);
    })
});
app.post('/community/joinrequest', function (req, res) {
  //console.log(req.body);
  community.find({
      "_id": req.body.id,
    })
    .then(data => {
      
      if (data[0].Rule == "Direct") {
        console.log("inside if");
		  community.findOneAndUpdate({
			  "_id":req.body.id
		  },
									 {
			  $push:{
				  Members:req.session.ID
			  }
		  }
		,{safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }
			  else{
        //do stuff
            user.findOneAndUpdate({
			  "_id":req.session.ID
		  },{
			  $push:{
				  Joinedsid:req.body.id
			  }
			},{safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }else{
        //do stuff
            res.redirect(`/commpanel/${req.session.ID}`);
        }
		  } )
        }
		   }
		  
		)						 }
	  else if (data[0].Rule == "Permission") {
        console.log("inside request else\n");
		  community.findOneAndUpdate({
			  "_id":req.body.id
		  },{
			  $push:{
				  Requested:req.session.ID
			  }
		  },{safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }else{
        
            res.redirect(`/commpanel/${req.session.ID}`);
        
        }
		  } )
      }
    })
    .catch(err => {
      console.error(err)
      res.send(err);
    })
});


app.listen('3000');