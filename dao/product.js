// MySQL Initialization
const mysql=require("./mysql-con.js");
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
	}
};