const API_VERSION="1.0";
let fs=require("fs");
// MySQL Initialization
let mysql=require("mysql");
let mysqlCon=mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"123456",
	database:"stylish"
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
			let colors=req.body.colors.split(",");
			let sizes=req.body.sizes.split(",");
			mysqlCon.beginTransaction(function(error){
				if(error){throw error;}
				let product={
					category:req.body.category,
					title:req.body.title,
					description:req.body.description,
					price:req.body.price,
					texture:req.body.texture,
					wash:req.body.wash,
					place:req.body.place,
					note:req.body.note,
					story:req.body.story
				};
				mysqlCon.query("insert into product set ?", product, function(error, results, fields){
					if(error){
						console.log(error);
						return mysqlCon.rollback(function(){
							throw error;
						});
					}
					let productId=results.insertId;
					let variants=[];
					for(let i=0;i<colors.length;i++){
						for(let j=0;j<sizes.length;j++){
							variants.push([
								colors[i], sizes[j], Math.round(Math.random()*10), productId
							]);
						}
					}
					mysqlCon.query("insert into variant(color,size,stock,product_id) values ?", [variants], function(error, results, fields){
						if(error){
							console.log(error);
							return mysqlCon.rollback(function(){
								throw error;
							});
						}
						mysqlCon.commit(function(error){
							if(error){
								return mysqlCon.rollback(function(){
									throw error;
								});
							}
							fs.mkdirSync("./public/assets/"+productId);
							fs.renameSync(req.files["mainImage"][0].path, "./public/assets/"+productId+"/main.jpg");
							for(let i=0;i<req.files["otherImages"].length;i++){
								fs.renameSync(req.files["otherImages"][i].path, "./public/assets/"+productId+"/"+i+".jpg");
							}
							res.send({status:"ok"});
						});
					});					
				});
			});
		}
	});
});
// Product API
app.get("/api/"+API_VERSION+"/products/:listName", function(req, res){
	console.log(listName);
	switch(listName){
		case "hots":
			break;
		case "all":
			break;
		case "boys": case "girls": case "accessories":
			break;
		case "search":
			break;
	}
});
// git password: af7258ba52ea0bd3756239234f5f46812cc57510 
