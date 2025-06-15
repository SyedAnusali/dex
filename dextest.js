//the tradermust have ETH in his wallet  such that ETH>= buy order Amount

//the buy order should be ordered on price from highest price to lowest

// the sell,the user must have enough token deposited such that  token balance >=sell amount

/*const Dex = artifacts.require("Dex");  
const Link = artifacts.require("Link");  
const truffleAssert = require('truffle-assertions');  


contract("Dex", accounts => {  

    it("the BUY order should be placed from higher to lower price", async () => {  
        
        let dex = await Dex.deployed();  
        let link = await Link.deployed(); // Correct initialization of Link  
        
        // Approve tokens and deposit ETH  
        await link.approve(dex.address, 500, { from: accounts[0] });  
       // await dex.depositETH({ value: 3000, from: accounts[0] });  

        // Create buy limit orders  
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 400, { from: accounts[0] });  
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 300, { from: accounts[0] });  
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 200, { from: accounts[0] });  
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 150, { from: accounts[0] });  

        let orderbook = await dex.getOrderbook(web3.utils.fromUtf8("LINK"), 0);  

        assert(orderbook.length> 0);
        
        // Ensure order prices are in correct order  
        for (let i = 0; i < orderbook.length - 1; i++) {  
            assert(orderbook[i].price >= orderbook[i + 1].price, "Order prices are not sorted correctly for BUY orders");  
        }  
    });  

    it("the SELL order should be placed from lower to higher price", async () => {  
        
        let dex = await Dex.deployed();  
        let link = await Link.deployed(); // Correct initialization of Link  

        // Here, you need to ensure there are enough tokens to sell.  
        await link.approve(dex.address, 500, { from: accounts[0] });  
        //await dex.depositETH({ value: 3000, from: accounts[0] });  

        // Assume you mint or transfer LINK tokens to accounts[0] before trying to sell  
        await link.transfer(accounts[0], 500, { from: accounts[1] }); // Ensure sender has LINK tokens  

        // Create sell limit orders  
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 100, { from: accounts[0] });  
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 200, { from: accounts[0] });  
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 300, { from: accounts[0] });  
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 400, { from: accounts[0] });  

        let orderbook = await dex.getOrderbook(web3.utils.fromUtf8("LINK"), 1);  
        
        // Ensure order prices are in correct order  
        for (let i = 0; i < orderbook.length - 1; i++) {  
            assert(orderbook[i].price <= orderbook[i + 1].price, "Order prices are not sorted correctly for SELL orders");  
        }  
    });  
});*/  


const Dex = artifacts.require("Dex");  
const Link = artifacts.require("Link");  
const truffleAssert = require('truffle-assertions');  




contract("DEX", accounts =>{
   it("the BUY order should be placed from higher to lower price", async () => {  
        let dex = await Dex.deployed();  
        let link = await Link.deployed(); // Correct initialization of Link  
    
        await link.approve(dex.address, 500); // Approve DEX to spend LINK tokens  
        await dex.depositETH({ value: 3000 }); // Deposit ETH into the DEX  
    
        // Create BUY orders with different prices  
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 300);  
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 200);  
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 150);  
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 100);  
    
        // Fetch the order book for BUY orders (type 0)  
        let Orderbook = await dex.getOrderbook(web3.utils.fromUtf8("LINK"), 0);  
        console.log(Orderbook);
      //  assert(Orderbook.length > 0);
    


        // Verify that orders are sorted from higher to lower price  
        for (let i = 0; i < Orderbook.length - 1; i++) {  
          // truffleAssert(Orderbook[i].price >= Orderbook[i + 1].price, "BUY orders are not sorted from higher to lower price");  
 
        }           
});

 

it("the sell order should be placed from lower to higher price", async () => {  
    let dex = await Dex.deployed();  
    let link = await Link.deployed(); // Correct initialization of Link  

    // Approve Dex to spend user's LINK  
  //  await link.approve(dex.address, 500, {from:accounts[0]}); // Add from: userAddress  

     

    // Creating limit orders  
    await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 300, );  
    await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 200, );  
    await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 150, );  
    await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 100,);  

    // Retrieve order book  
    let Orderbook = await dex.getOrderbook(web3.utils.fromUtf8("LINK"), 1);  
    console.log(Orderbook);  
  

    // Check that orders are sorted correctly  
    for (let i = 0; i < Orderbook.length - 1; i++) {  
        assert(Orderbook[i].price <= Orderbook[i + 1].price, "not right order price");  
    }  
});  

})


   
 