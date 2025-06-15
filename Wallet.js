const Dex = artifacts.require("Dex");  
const Link = artifacts.require("Link");  
const truffleAssert = require('truffle-assertions');  


contract("Dex", accounts => {  

    it("should allow adding a token", async () => {  
        // Deploy Link contract (uncomment this line if it's not already deployed)  
        // await deployer.deploy(Link);  

        let dex = await Dex.deployed();  
        let link = await Link.deployed(); // Correct initialization of Link  

        await truffleAssert.passes(  
            dex.addToken(web3.utils.fromUtf8("LINK"), link.address, { from: accounts[0] })  
        );  
    });  

    it("should deposit correctly", async () => {  
        let dex = await Dex.deployed();  
        let link = await Link.deployed();  

        await link.approve(dex.address, 800);{ from: accounts[0] }; //ake sure to specify the account  
        await dex.deposit(100,web3.utils.fromUtf8("LINK")); { from:accounts[0] }  // Ensure the sender is correct  

        let balance = await dex.balances(accounts[0], web3.utils.fromUtf8("LINK")); // Use await and correct access  

        assert.equal(balance.toNumber(), 100,);
     });  


it("should faulty withdrawals correctly", async () => {  
    let dex = await Dex.deployed();  
    let link = await Link.deployed();  

    await truffleAssert.reverts(dex.withdrawal (500,web3.utils.fromUtf8("LINK"))) });




    it("should withdraw correctly", async () => {  
    let dex = await Dex.deployed();  
    let link = await Link.deployed();  

    // Ensure a deposit is made to have enough balance for withdrawal first  
    await link.approve(dex.address, 800, { from: accounts[0] });  
    await dex.deposit(100, web3.utils.fromUtf8("LINK"), { from: accounts[0] });  

    // Now, perform the withdrawal  
    await truffleAssert.passes(  
        dex.withdrawal(100, web3.utils.fromUtf8("LINK"), { from: accounts[0] })  
    );  







    




    // Verify the balance after withdrawal  
   // let balance = await dex.balances(accounts[0], web3.utils.fromUtf8("LINK"));  
   // assert.equal(balance.toNumber(), 150, "Balance should be 150 after withdrawal.");  
});  
});