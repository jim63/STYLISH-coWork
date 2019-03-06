// MySQL Initialization
const mysql=require("../mysqlcon.js");
// Build DAO Object
module.exports={
	insert:function(req){
		return new Promise(function(resolve, reject){
			let colorCodes=req.body.color_codes.split(",");
			let colorNames=req.body.color_names.split(",");
			let sizes=req.body.sizes.split(",");
			mysql.con.beginTransaction(function(error){
				if(error){
					reject("Database Query Error");
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
				mysql.con.query("insert into product set ?", product, function(error, results, fields){
					if(error){
						reject("Database Query Error: "+erorr);
						return mysql.con.rollback(function(){
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
					mysql.con.query("insert into variant(color_code,color_name,size,stock,product_id) values ?", [variants], function(error, results, fields){
						if(error){
							reject("Database Query Error: "+erorr);
							return mysql.con.rollback(function(){
								throw error;
							});
						}
						mysql.con.commit(function(error){
							if(error){
								reject("Database Query Error: "+erorr);
								return mysql.con.rollback(function(){
									throw error;
								});
							}
							fs.mkdirSync(cst.STYLISH_HOME+"/public/assets/"+productId);
							fs.renameSync(req.files["main_image"][0].path, cst.STYLISH_HOME+"/public/assets/"+productId+"/main.jpg");
							for(let i=0;i<req.files["other_images"].length;i++){
								fs.renameSync(req.files["other_images"][i].path, cst.STYLISH_HOME+"/public/assets/"+productId+"/"+i+".jpg");
							}
							resolve("OK");
						});
					});					
				});
			});
		});
	},
	get:function(productId){
		return new Promise(function(resolve, reject){
			let query="select * from product where id = ?";
			mysql.con.query(query, [productId], function(error, results, fields){
				if(error){
					reject("Database Query Error");
				}else{
					if(results.length===0){
						resolve(null);
					}else{
						let product=results[0];
						query="select * from variant where product_id = ?";
						mysql.con.query(query, [product.id], function(error, results, fields){
							if(error){
								reject("Database Query Error");
							}else{
								product.colors=[];
								product.sizes=[];
								product.variants=[];
								product.main_image=cst.PROTOCOL+cst.HOST_NAME+"/assets/"+product.id+"/main.jpg";
								product.images=[
									cst.PROTOCOL+cst.HOST_NAME+"/assets/"+product.id+"/0.jpg",
									cst.PROTOCOL+cst.HOST_NAME+"/assets/"+product.id+"/1.jpg",
									cst.PROTOCOL+cst.HOST_NAME+"/assets/"+product.id+"/0.jpg",
									cst.PROTOCOL+cst.HOST_NAME+"/assets/"+product.id+"/1.jpg"
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
								resolve(product);
							}
						});
					}
				}
			});
		});
	}
};