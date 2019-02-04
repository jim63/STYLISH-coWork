let fs=require("fs");
// MySQL Initialization
let mysql=require("mysql");
let mysqlCon=mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"123456"
});
mysqlCon.connect(function(err){
	if(err){
		throw err;
	}else{
		console.log("Connected!");
	}
});
// Express Initialization
let express=require("express");
let multer=require("multer");
let app=express();
app.use(express.static("public"));
app.listen(80, function(){
	console.log("Server Started");
});
// Product Management
app.post("/api/product", function(req, res){
	let upload=multer({dest:"./tmp"}).fields([
		{name:"mainImage", maxCount:1},
		{name:"otherImages", maxCount:3}
	]);	
	upload(req, res, function(error){
		if(error){
			res.send({error:"Upload Images Error"});
		}else{
			mysqlCon.query("insert into product(title,description) values('"+req.body.title+"','"+req.body.description+"')", function(error, result){
				if(error){
					res.send({error:"Database Error"});
				}else{
					let productId=result.insertId;
					fs.renameSync(req.files["mainImage"][0].path, "./public/assets/"+productId+"/main.jpg");
					for(let i=0;i<req.files["otherImages"].length;i++){
						fs.renameSync(req.files["otherImages"][i].path, "./public/assets/"+productId+"/"+i+".jpg");
					}
					res.send({status:"ok"});
				}
			});
		}
	});
});
// git password: af7258ba52ea0bd3756239234f5f46812cc57510 