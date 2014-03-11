WoodenBat = Melee.extend(function(){
	this.range = 40;
	this.width = 40;
	this.delay = 5;
	this.damage = 55;

	this.name = "Wooden Bat";
	try{this.icon = batIcon}catch(e){}
	this.type = WOODENBAT;
})
.methods({

});