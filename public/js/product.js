app.state.product=null;
app.state.variant=null;
app.state.qty=0;
app.init=function(){
	let id=app.getParameter("id");
	if(!id){
		window.location="./";
	}
	app.cart.init();
	app.getProduct(id);
	// init event handlers
	app.setEventHandlers(app.get("#product-add-cart-btn"), {
		click:function(){
			app.cart.add(app.state.product, app.state.variant, app.state.qty);
		}
	});
};
app.getProduct=function(id){
	app.ajax("get", app.cst.API_HOST+"/exe/product/get", "id="+id, function(req){
		let data=JSON.parse(req.responseText).data;
		let variant;
		for(let key in data.variants){
			variant=data.variants[key];
			if(variant.stock>0){
				app.state.variant=variant;
				break;
			}
		}
		app.state.product=data;
		app.state.qty=1;
		// update menu item
		app.updateMenuItems(app.state.product.category);
		// show product
		app.showProduct();
	});
};
app.showProduct=function(){
	let product=app.state.product;
	app.get("#product-name").textContent=product.name;
	app.get("#product-id").textContent=product.id;
	app.get("#product-price").textContent="TWD."+product.price;
	app.get("#product-summary").innerHTML=product.summary;
	app.storage.ref(product.id+"/main.jpg").getDownloadURL().then((url)=>{
		app.createElement("img", {atrs:{
			src:url
		}}, app.get("#product-main-image"));
	});
	// colors
	let colorContainer=app.get("#product-colors");
	for(let key in product.colors){
		let color=product.colors[key];
		app.createElement("div", {atrs:{
			className:"color"+(app.state.variant.color.code===color.code?" current":""),
			value:color
		}, stys:{
			backgroundColor:"#"+color.code
		}, evts:{
			click:app.evts.clickColor
		}}, colorContainer);
	}
	// sizes
	let sizeContainer=app.get("#product-sizes");
	product.sizes.split(",").forEach((size)=>{
		let outStock=product.variants[size+"-"+app.state.variant.color.code].stock===0;
		app.createElement("div", {atrs:{
			className:"size"+(app.state.variant.size===size?" current":"")+(outStock?" disabled":""),
			textContent:size,
			value:size
		}, evts:{
			click:app.evts.clickSize
		}}, sizeContainer);
	});
	// qty
	app.get("#product-qty>.value").textContent=app.state.qty;
	let ops=app.getAll("#product-qty>.op");
	ops.forEach((op)=>{
		op.addEventListener("click", app.evts.clickQty);
	});
	// story
	app.get("#product-story").innerHTML=product.story;
	// images
	for(let i=0;i<2;i++){
		app.storage.ref(product.id+"/"+i+".jpg").getDownloadURL().then((url)=>{
			app.createElement("img", {atrs:{
				src:url
			}}, app.get("#product-images"));
		});
	}
};
app.refreshProductVariants=function(){
	let variants=app.state.product.variants;
	let variant=app.state.variant;
	let colors=app.getAll("#product-colors>.color");
	for(let i=0;i<colors.length;i++){
		if(colors[i].value.code===variant.color.code){
			colors[i].classList.add("current");
		}else{
			colors[i].classList.remove("current");
		}
	}
	let sizes=app.getAll("#product-sizes>.size");
	let outStock;
	for(let i=0;i<sizes.length;i++){
		// control current
		if(sizes[i].value===variant.size){
			sizes[i].classList.add("current");
		}else{
			sizes[i].classList.remove("current");
		}
		outStock=variants[sizes[i].value+"-"+variant.color.code].stock===0;
		// control disabled
		if(outStock){
			sizes[i].classList.add("disabled");
		}else{
			sizes[i].classList.remove("disabled");
		}
	}
	app.get("#product-qty>.value").textContent=app.state.qty;
};
	app.evts.clickColor=function(e){
		let color=e.currentTarget.value;
		let variants=app.state.product.variants;
		app.state.variant=variants[app.state.variant.size+"-"+color.code];
		if(app.state.variant.stock===0){ // out of stock, choose another size automatically
			let sizes=app.state.product.sizes.split(",");
			for(let i=0;i<sizes.length;i++){
				if(variants[sizes[i]+"-"+color.code].stock>0){
					app.state.variant=variants[sizes[i]+"-"+color.code];
					break;
				}
			}
		}
		app.state.qty=1;
		app.refreshProductVariants();
	};
	app.evts.clickSize=function(e){
		if(e.currentTarget.classList.contains("disabled")){
			return;
		}
		let size=e.currentTarget.value;
		let variants=app.state.product.variants;
		app.state.variant=variants[size+"-"+app.state.variant.color.code];
		app.state.qty=1;
		app.refreshProductVariants();
	};
	app.evts.clickQty=function(e){
		let value=parseInt(e.currentTarget.getAttribute("data-value"));
		let qty=app.state.qty;
		qty=qty+value;
		if(qty>0&&qty<app.state.variant.stock){
			app.state.qty=qty;
			app.get("#product-qty>.value").textContent=app.state.qty;
		}
	};
window.addEventListener("DOMContentLoaded", app.init);