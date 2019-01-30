// MySQL Initialization
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
// Express Initialization
let express=require("express");
let app=express();
app.use(express.static("public"));
app.listen(80, function(){
	console.log("Server Started");
});
// git password: af7258ba52ea0bd3756239234f5f46812cc57510 