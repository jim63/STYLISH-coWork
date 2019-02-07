const PROTOCOL="http://";
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
let bodyparser=require("body-parser");
let multer=require("multer");
let app=express();
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));
app.listen(80, function(){
	console.log("Server Started");
});
// Admin API
app.post("/api/"+API_VERSION+"/admin/product", function(req, res){
	let upload=multer({dest:"./tmp"}).fields([
		{name:"main_image", maxCount:1},
		{name:"other_image", maxCount:3}
	]);	
	upload(req, res, function(error){
		if(error){
			res.send({error:"Upload Images Error"});
		}else{
			let colorCodes=req.body.color_codes.split(",");
			let colorNames=req.body.color_names.split(",");
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
				if(req.body.id){
					product.id=req.body.id;
				}
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
							fs.renameSync(req.files["main_image"][0].path, "./public/assets/"+productId+"/main.jpg");
							for(let i=0;i<req.files["other_image"].length;i++){
								fs.renameSync(req.files["other_image"][i].path, "./public/assets/"+productId+"/"+i+".jpg");
							}
							res.send({status:"OK"});
						});
					});					
				});
			});
		}
	});
});
app.post("/api/"+API_VERSION+"/admin/campaign", function(req, res){
	let campaign={
		product_id:parseInt(req.body.product_id),
		picture:req.body.picture,
		story:req.body.story
	};
	mysqlCon.query("insert into campaign set ?", campaign, function(error, results, fields){
		if(error){
			res.send({error:"Add Campaign Error"});
		}else{
			res.send({status:"OK"});
		}
	});
});
app.post("/api/"+API_VERSION+"/admin/hot", function(req, res){
	let title=req.body.title;
	let productIds=req.body.product_ids.split(",");
	mysqlCon.beginTransaction(function(error){
		if(error){throw error;}
		let hot={
			title:title,
		};
		mysqlCon.query("insert into hot set ?", hot, function(error, results, fields){
			if(error){
				return mysqlCon.rollback(function(){
					throw error;
				});
			}
			let hotId=results.insertId;
			let hotProductMapping=[];
			for(let i=0;i<productIds.length;i++){
				hotProductMapping.push([
					hotId, parseInt(productIds[i])
				]);
			}
			mysqlCon.query("insert into hot_product(hot_id,product_id) values ?", [hotProductMapping], function(error, results, fields){
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
					res.send({status:"OK"});
				});
			});					
		});
	});
});
// Marketing Campaign API for Front-End
app.get("/api/"+API_VERSION+"/marketing/campaigns", function(req, res){
	let query="select * from campaign order by id";
	mysqlCon.query(query, function(error, results, fields){
		if(error){
			res.send({error:"Database Query Error"});
		}else{
			res.send({data:results});
		}
	});
});
// Marketing Hots API for Apps
app.get("/api/"+API_VERSION+"/marketing/hots", function(req, res){
	let query="select hot.title as title,hot_product.product_id as product_id from hot,hot_product where hot.id=hot_product.hot_id order by hot.id";
	mysqlCon.query(query, function(error, results, fields){
		if(error){
			res.send({error:"Database Query Error"});
		}else{
			let data=[];
			let hot;
			for(let i=0;i<results.length;i++){
				hot=data.find((hot)=>{return hot.title===results[i].title});
				if(hot){
					hot.products.push(results[i].product_id);
				}else{
					data.push({title:results[i].title, products:[results[i].product_id]});
				}
			}
			let total=data.length;
			let loaded=0;
			for(let i=0;i<data.length;i++){
				listProducts({where:" where id in ("+data[i].products.join(",")+")"}, data[i].products.length, 0, function(body){
					data[i].products=body.data;
					loaded++;
					if(loaded>=total){
						res.send({data:data});
					}
				});
			}
		}
	});
});
// Product API
app.get("/api/"+API_VERSION+"/products/details", function(req, res){
	let productId=parseInt(req.query.id);
	if(!Number.isInteger(productId)){
		res.send({error:"Wrong Request"});
		return;
	}
	let query="select * from product where id = ?";
	mysqlCon.query(query, [productId], function(error, results, fields){
		if(error){
			callback({error:"Database Query Error"});
		}else{
			if(results.length===0){
				res.send({data:null});
			}else{
				let product=results[0];
				query="select * from variant where product_id = ?";
				mysqlCon.query(query, [product.id], function(error, results, fields){
					if(error){
						res.send({error:"Database Query Error"});
					}else{
						product.colors=[];
						product.sizes=[];
						product.stocks=[];
						product.main_image=PROTOCOL+HOST_NAME+"/assets/"+product.id+"/main.jpg";
						product.images=[
							PROTOCOL+HOST_NAME+"/assets/"+product.id+"/0.jpg",
							PROTOCOL+HOST_NAME+"/assets/"+product.id+"/1.jpg"
						];
						let variant;
						for(let i=0;i<results.length;i++){
							variant=results[i];
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
								color_code:variant.color_code,
								size:variant.size,
								stock:variant.stock
							});
						}
						res.send({data:product});
					}
				});
			}
		}
	});
});
app.get("/api/"+API_VERSION+"/products/:category", function(req, res){
	let paging=parseInt(req.query.paging);
	if(!Number.isInteger(paging)){
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
			if(filters.where){
				filter=filters.where;
			}else if(filters.keyword){
				filter=" where title like "+mysqlCon.escape("%"+filters.keyword+"%");
			}else if(filters.category){
				filter=" where category="+mysqlCon.escape(filters.category);
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
										product.main_image=PROTOCOL+HOST_NAME+"/assets/"+product.id+"/main.jpg";
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
											color_code:variant.color_code,
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
