RandomGunTester = RandomGun.extend(function(awesomeness) {
})
.methods({
	reload: function() {
		if (this.ammo!="R") {
			this.awesomeness=Math.random();
			this.makeRandomProperties(this.awesomeness);
			this.supr();
		}
	}
});