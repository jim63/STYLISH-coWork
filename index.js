let mysql=require("mysql");
let con=mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"123456"
});
con.connect(function(err){
	if(err){
		throw err;
	}else{
		console.log("Connected!");
	}
});
let express=require("express");
let app=express();
app.listen(80, function(){
	console.log("Server Started");
});
// git password: af7258ba52ea0bd3756239234f5f46812cc57510 