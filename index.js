const PROTOCOL="https://";
const HOST_NAME="18.214.165.31";
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
			let colorCodes=req.body.colorCodes.split(",");
			let colorNames=req.body.colorNames.split(",");
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
						return mysqlCon.rollback(function(){
							throw error;
						});
					}
					let productId=results.insertId;
					let variants=[];
					for(let i=0;i<colorCodes.length;i++){
						for(let j=0;j<sizes.length;j++){
							variants.push([
								colorCodes[i], colorNames[i], sizes[j], Math.round(Math.random()*10), productId
							]);
						}
					}
					mysqlCon.query("insert into variant(color_code,color_name,size,stock,product_id) values ?", [variants], function(error, results, fields){
						if(error){
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
							res.send({status:"OK"});
						});
					});					
				});
			});
		}
	});
});
// Product API
app.get("/api/"+API_VERSION+"/products/:category", function(req, res){
	let paging=req.query.paging;
	if(!paging || !Number.isInteger(paging)){
		paging=0;
	}
	let size=6;
	let category=req.params.category;
	let result={error:"Wrong Request"};
	let listCallback=function(data){
		res.send(data);
	};
	switch(category){
		case "hots":
			break;
		case "all":
			listProducts(null, size, paging, listCallback);
			break;
		case "boys": case "girls": case "accessories":
			listProducts({
				category:category
			}, size, paging, listCallback);
			break;
		case "search":
			if(req.query.keyword){
				listProducts({
					keyword:req.query.keyword
				}, size, paging, listCallback);
			}else{
				res.send({error:"Wrong Request"});
			}
			break;
	}
});
	function listProducts(filters, size, paging, callback){
		let offset=paging*size;
		let filter="";
		if(filters!==null){
			if(filters.keyword){
				filter=" where title like "+mysqlCon.escape("%"+filters.keyword+"%");
			}else if(filters.category){
				filter=" where category="+mysqlCon.escape(category);
			}
		}
		let query="select count(*) as total from product";
		mysqlCon.query(query+filter, function(error, results, fields){
			if(error){
				callback({error:"Database Query Error"});
			}else{
				let maxPage=Math.floor((results[0].total-1)/size);
				let body={};
				if(paging<maxPage){
					body.paging=paging+1;
				}
				query="select * from product";
				mysqlCon.query(query+filter+" limit ?,?", [offset,size], function(error, results, fields){
					if(error){
						callback({error:"Database Query Error"});
					}else{
						if(results.length===0){
							body.data=[];
							callback(body);
						}else{
							let products=results;
							query="select * from variant where product_id in ("+products.map((product)=>{
								return product.id;
							}).join(",")+")";
							mysqlCon.query(query, function(error, results, fields){
								if(error){
									callback({error:"Database Query Error"});
								}else{
									products.forEach((product)=>{
										product.colors=[];
										product.sizes=[];
										product.stocks=[];
										product.mainImage=PROTOCOL+HOST_NAME+"/assets/"+product.id+"/mainImage.jpg";
										product.images=[
											PROTOCOL+HOST_NAME+"/assets/"+product.id+"/0.jpg",
											PROTOCOL+HOST_NAME+"/assets/"+product.id+"/1.jpg"
										];
									});
									let product, variant;
									for(let i=0;i<results.length;i++){
										variant=results[i];
										product=products.find((product)=>{
											return product.id===variant.product_id;
										});
										if(product.colors.findIndex((color)=>{
											return color.code===variant.color_code
										})===-1){
											product.colors.push({
												code:variant.color_code, name:variant.color_name
											});
										}
										if(product.sizes.indexOf(variant.size)===-1){
											product.sizes.push(variant.size);
										}
										product.stocks.push({
											colorCode:variant.color_code,
											size:variant.size,
											stock:variant.stock
										});
									}
									body.data=products;
									callback(body);
								}
							});
						}
					}
				});
			}
		});
	}
// git password: af7258ba52ea0bd3756239234f5f46812cc57510 
