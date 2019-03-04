const STYLISH_HOME="/srv/www/stylish-backend";
const PROTOCOL="https://";
const HOST_NAME="api.appworks-school.tw";
const API_VERSION="1.0";
const TAPPAY_PARTNER_KEY="partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG";
// Utilities
const crypto=require("crypto");
const fs=require("fs");
const request=require("request");
// MySQL Initialization
const mysql=require("mysql");
const mysqlCon=mysql.createConnection({
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
const express=require("express");
const bodyparser=require("body-parser");
const multer=require("multer");
const app=express();
app.use(express.static(STYLISH_HOME+"/public"));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
/*
app.listen(80, function(){
	console.log("Server Started");
});
*/
app.use("/api/", function(req, res, next){
	res.set("Access-Control-Allow-Origin", "*");
	res.set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
	res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
	res.set("Access-Control-Allow-Credentials", "true");
	next();
});
// Admin API
app.post("/api/"+API_VERSION+"/admin/product", function(req, res){
	let upload=multer({dest:"./tmp"}).fields([
		{name:"main_image", maxCount:1},
		{name:"other_images", maxCount:3}
	]);	
	upload(req, res, function(error){
		if(error){
			res.send({error:"Upload Images Error"});
		}else{
			let colorCodes=req.body.color_codes.split(",");
			let colorNames=req.body.color_names.split(",");
			let sizes=req.body.sizes.split(",");
			mysqlCon.beginTransaction(function(error){
				if(error){
					res.send({error:"Database Query Error"});
					throw error;
				}
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
						res.send({error:"Database Query Error: "+erorr});
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
							res.send({error:"Database Query Error: "+erorr});
							return mysqlCon.rollback(function(){
								throw error;
							});
						}
						mysqlCon.commit(function(error){
							if(error){
								res.send({error:"Database Query Error: "+erorr});
								return mysqlCon.rollback(function(){
									throw error;
								});
							}
							fs.mkdirSync(STYLISH_HOME+"/public/assets/"+productId);
							fs.renameSync(req.files["main_image"][0].path, STYLISH_HOME+"/public/assets/"+productId+"/main.jpg");
							for(let i=0;i<req.files["other_images"].length;i++){
								fs.renameSync(req.files["other_images"][i].path, STYLISH_HOME+"/public/assets/"+productId+"/"+i+".jpg");
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
		if(error){
			throw error;
		}
		let hot={
			title:title,
		};
		mysqlCon.query("insert into hot set ?", hot, function(error, results, fields){
			if(error){
				res.send({error:"Database Query Error"});
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
					res.send({error:"Database Query Error"});
					return mysqlCon.rollback(function(){
						throw error;
					});
				}
				mysqlCon.commit(function(error){
					if(error){
						res.send({error:"Database Query Error"});
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
						product.variants=[];
						product.main_image=PROTOCOL+HOST_NAME+"/assets/"+product.id+"/main.jpg";
						product.images=[
							PROTOCOL+HOST_NAME+"/assets/"+product.id+"/0.jpg",
							PROTOCOL+HOST_NAME+"/assets/"+product.id+"/1.jpg",
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
							product.variants.push({
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
		case "men": case "women": case "accessories":
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
		default:
			res.send({error:"Wrong Request"});
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
										product.variants=[];
										product.main_image=PROTOCOL+HOST_NAME+"/assets/"+product.id+"/main.jpg";
										product.images=[
											PROTOCOL+HOST_NAME+"/assets/"+product.id+"/0.jpg",
											PROTOCOL+HOST_NAME+"/assets/"+product.id+"/1.jpg",
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
										product.variants.push({
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
// User API
app.post("/api/"+API_VERSION+"/user/signup", function(req, res){
	let data=req.body;
	if(!data.name||!data.email||!data.password){
		res.send({error:"Request Error: name, email and password are required."});
		return;
	}
	mysqlCon.beginTransaction(function(error){
		if(error){
			throw error;
		}
		mysqlCon.query("select * from user where email = ?", [data.email], function(error, results, fields){
			if(error){
				res.send({error:"Database Query Error"});
				return mysqlCon.rollback(function(){
					throw error;
				});
			}
			if(results.length>0){
				res.send({error:"Email Already Exists"});
				return;
			}
			let commitCallback=function(error){
				if(error){
					res.send({error:"Database Query Error"});
					return mysqlCon.rollback(function(){
						throw error;
					});
				}
				res.send({data:{
					access_token:user.access_token,
					access_expired:Math.floor((user.access_expired-now)/1000),
					user:{
						id:user.id,
						provider:user.provider,
						name:user.name,
						email:user.email,
						picture:user.picture
					}
				}});
			};
			let now=Date.now();
			let sha=crypto.createHash("sha256");
			sha.update(data.email+data.password+now);
			let accessToken=sha.digest("hex");
			let user={
				provider:"native",
				email:data.email,
				password:data.password,
				name:data.name,
				picture:null,
				access_token:accessToken,
				access_expired:now+(30*24*60*60*1000) // 30 days
			};
			let query="insert into user set ?";
			mysqlCon.query(query, user, function(error, results, fields){
				if(error){
					res.send({error:"Database Query Error"});
					return mysqlCon.rollback(function(){
						throw error;
					});
				}
				user.id=results.insertId;
				mysqlCon.commit(commitCallback);
			});
		});
	});
});
app.post("/api/"+API_VERSION+"/user/signin", function(req, res){
	let data=req.body;
	if(data.provider==="native"){
		if(!data.email||!data.password){
			res.send({error:"Request Error: email and password are required."});
			return;
		}
		mysqlCon.beginTransaction(function(error){
			if(error){
				throw error;
			}
			mysqlCon.query("select * from user where email = ? and password = ?", [data.email,data.password], function(error, results, fields){
				if(error){
					res.send({error:"Database Query Error"});
					return mysqlCon.rollback(function(){
						throw error;
					});
				}
				let user;
				let now=Date.now();
				let sha=crypto.createHash("sha256");
				sha.update(data.email+data.password+now);
				let accessToken=sha.digest("hex");
				let commitCallback=function(error){
					if(error){
						res.send({error:"Database Query Error"});
						return mysqlCon.rollback(function(){
							throw error;
						});
					}
					if(user===null){
						res.send({error:"Sign In Error"});
					}else{
						res.send({data:{
							access_token:user.access_token,
							access_expired:Math.floor((user.access_expired-now)/1000),
							user:{
								id:user.id,
								provider:user.provider,
								name:user.name,
								email:user.email,
								picture:user.picture
							}
						}});
					}
				};
				if(results.length===0){ // error
					user=null;
					mysqlCon.commit(commitCallback);
				}else{ // update
					user={
						id:results[0].id,
						provider:results[0].provider,
						email:results[0].email,
						name:results[0].name,
						picture:results[0].picture,
						access_token:accessToken,
						access_expired:now+(30*24*60*60*1000) // 30 days
					};
					let query="update user set access_token = ?, access_expired = ? where id = ?";
					mysqlCon.query(query, [user.access_token, user.access_expired, user.id], function(error, results, fields){
						if(error){
							res.send({error:"Database Query Error"});
							return mysqlCon.rollback(function(){
								throw error;
							});
						}
						mysqlCon.commit(commitCallback);
					});
				}
			});
		});
	}else if(data.provider==="facebook"){
		if(!data.access_token){
			res.send({error:"Request Error: access token is required."});
			return;
		}
		// Get profile from facebook
		getFacebookProfile(data.access_token).then(function(profile){
			if(!profile.id||!profile.name||!profile.email){
				res.send({error:"Permissions Error: id, name, email are required."});
				return;
			}
			mysqlCon.beginTransaction(function(error){
				if(error){
					throw error;
				}
				mysqlCon.query("select id from user where email = ? and provider = ?", [profile.email,data.provider], function(error, results, fields){
					if(error){
						res.send({error:"Database Query Error"});
						return mysqlCon.rollback(function(){
							throw error;
						});
					}
					let query;
					let now=Date.now();
					let user={
						provider:data.provider,
						email:profile.email,
						name:profile.name,
						picture:"https://graph.facebook.com/"+profile.id+"/picture?type=large",
						access_token:data.access_token,
						access_expired:now+(30*24*60*60*1000) // 30 days
					};
					if(results.length===0){ // insert
						query="insert into user set ?";
						query=mysql.format(query, user);
					}else{ // update
						user.id=results[0].id;
						query="update user set name = ?, access_token = ?, access_expired = ? where email = ?";
						query=mysql.format(query, [user.name, user.access_token, user.access_expired, user.email]);
					}
					mysqlCon.query(query, function(error, results, fields){
						if(error){
							res.send({error:"Database Query Error"});
							return mysqlCon.rollback(function(){
								throw error;
							});
						}
						if(!user.id){
							user.id=results.insertId;
						}
						mysqlCon.commit(function(error){
							if(error){
								res.send({error:"Database Query Error"});
								return mysqlCon.rollback(function(){
									throw error;
								});
							}
							res.send({data:{
								access_token:user.access_token,
								access_expired:Math.floor((user.access_expired-now)/1000),
								user:{
									id:user.id,
									provider:user.provider,
									name:user.name,
									email:user.email,
									picture:user.picture
								}
							}});
						});
					});					
				});
			});
		}).catch(function(error){
			res.send({error:error});
		});
	}else{
		res.send({error:"Wrong Request"});
	}
});
	let getFacebookProfile=function(accessToken){
		return new Promise((resolve, reject)=>{
			if(!accessToken){
				resolve(null);
				return;
			}
			request({
				url:"https://graph.facebook.com/me?fields=id,name,email&access_token="+accessToken,
				method:"GET"
			}, function(error, response, body){
				body=JSON.parse(body);
				if(body.error){
					reject(body.error);
				}else{
					resolve(body);
				}
			});
		});
	};
app.get("/api/"+API_VERSION+"/user/profile", function(req, res){
	let accessToken=req.get("Authorization");
	if(accessToken){
		accessToken=accessToken.replace("Bearer ", "");
	}else{
		res.send({error:"Wrong Request: authorization is required."});
		return;
	}
	mysqlCon.query("select * from user where access_token = ?", [accessToken], function(error, results, fields){
		if(error){
			res.send({error:"Database Query Error"});
		}else{
			if(results.length===0){
				res.send({error:"Invalid Access Token"});
			}else{
				res.send({data:{
					id:results[0].id,
					provider:results[0].provider,
					name:results[0].name,
					email:results[0].email,
					picture:results[0].picture
				}});
			}
		}
	});
});
// Check Out API
app.post("/api/"+API_VERSION+"/order/checkout", function(req, res){
	let data=req.body;
	if(!data.order||!data.order.total||!data.order.list||!data.prime){
		res.send({error:"Create Order Error: Wrong Data Format"});
		return;
	}
	let accessToken=req.get("Authorization");
	if(accessToken){
		accessToken=accessToken.replace("Bearer ", "");
	}
	// Get user profile from database
	getUserProfile(accessToken).then(function(profile){
		let now=new Date();
		let number=now.getMonth()+""+now.getDate()+""+(now.getTime()%(24*60*60*1000))+""+Math.floor(Math.random()*10);
		let orderRecord={
			number:number,
			time:now.getTime(),
			status:-1, // -1 for init (not pay yet)
			details:JSON.stringify(data.order)
		};
		if(profile!==null&&profile.id){
			orderRecord.user_id=profile.id;
		}
		let query="insert into order_table set ?";
		mysqlCon.query(query, orderRecord, function(error, results, fields){
			if(error){
				res.send({error:"Create Order Error"});
				return;
			}else{
				let orderId=results.insertId;
				// start payment
				request({
					url:"https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime",
					method:"POST",
					headers:{
						"Content-Type":"application/json",
						"x-api-key":TAPPAY_PARTNER_KEY
					},
					json:{
						"prime": data.prime,
						"partner_key": TAPPAY_PARTNER_KEY,
						"merchant_id": "AppWorksSchool_CTBC",
						"details": "Stylish Payment",
						"amount": data.order.total,
						"cardholder": {
							"phone_number": data.order.recipient.phone,
							"name": data.order.recipient.name,
							"email": data.order.recipient.email
						},
						"remember": false
					}
				}, function(error, response, body){
					if(body.status===0){ // OK
						let payment={
							order_id:orderId,
							details:JSON.stringify(body)
						};
						createPayment(payment, function(result){
							if(true){
								res.send({data:{number:orderRecord.number}});
							}else{
								res.send({error:"Create Payment Error"});
							}
						});
					}else{
						res.send({error:"Payment Failed: "+body.msg});
					}
				});
			}
		});
	}).catch(function(error){
		res.send({error:error});
	});
});
	let getUserProfile=function(accessToken){
		return new Promise((resolve, reject)=>{
			if(!accessToken){
				resolve(null);
				return;
			}
			mysqlCon.query("select * from user where access_token = ?", [accessToken], function(error, results, fields){
				if(error){
					resolve({error:"Database Query Error"});
				}else{
					if(results.length===0){
						resolve({error:"Invalid Access Token"});
					}else{
						resolve({
							id:results[0].id,
							provider:results[0].provider,
							name:results[0].name,
							email:results[0].email,
							picture:results[0].picture
						});
					}
				}
			});
		});
	};
	let createPayment=function(payment, callback){
		mysqlCon.beginTransaction(function(error){
			if(error){
				throw error;
			}
			mysqlCon.query("insert into payment set ?", payment, function(error, results, fields){
				if(error){
					callback(false);
					return mysqlCon.rollback(function(){
						throw error;
					});
				}
				mysqlCon.query("update order_table set status = ?", [0], function(error, results, fields){
					if(error){
						callback(false);
						return mysqlCon.rollback(function(){
							throw error;
						});
					}
					mysqlCon.commit(function(error){
						if(error){
							callback(false);
							return mysqlCon.rollback(function(){
								throw error;
							});
						}
						callback(true);
					});
				});					
			});
		});
	};
module.exports=app;
// git password: af7258ba52ea0bd3756239234f5f46812cc57510 