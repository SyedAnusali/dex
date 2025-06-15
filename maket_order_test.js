//condition for making marketorder
//1:while making market order the seller  should have enough token for the trade//
//2:while making market order the buyer  should have enough eth for the trade//
//3: market order can be submitted if even order book is empty
//4: market order should be submitted util the  order book is empty or the order book is filled 100%
//5:the eth balance of the buyer should derease with the  filled amount
//6:the  token balance of the limit orders sellers should decrease with the filled amounts
//7:FILLED limit order should be  removed  from the  orderbook


const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");
const truffleAssert = require("truffle-assertions");

contract("DEX", accounts =>{
    //1:while making market order the seller  should have enough token for the trade//
    it("Should throw  an error while making  a sell market order without adequate  token balance",async ()=>{
        let  dex =await Dex.deployed()
        let balance = await dex.balances(accounts[0],web3.utils.fromUtf8("LINK"))
        assert.equal( balance.toNumber(),0, "intial LINK balance is not 0");
    
    await truffleAssert.passes(
        dex.createMarketOrder(1,web3.utils.fromUtf8("LINK"),10)
    )
    
    })
    
    
    //2:while making buy  market order the buyer  should have enough eth for the trade//
    it("Should throw  an error while making  a buy market order without adequate  ETH balance",async ()=>{
        let  dex =await Dex.deployed()
        let balance = await dex.balances(accounts[0],web3.utils.fromUtf8("ETH"))
        assert.equal( balance.toNumber(),0, "intial ETH balance is not 0");
        //await dex.createLimitorder(1,web3.utils.fromUtf8("LiNK"),5,300,{from: accounts[1]})
    
    await truffleAssert.passes(
        dex.createMarketOrder(0,web3.utils.fromUtf8("LINK"),5)
    )
    
    })  
    //3: market order can be submitted even the order book is empty//
    it("Market order can be submitted even if the order book is empty",async ()=>{
        let  dex =await Dex.deployed()
    
        await dex.depositETH({value:50000});
    
        let orderbook = await dex.getOrderbook(web3.utils.fromUtf8("LINK"),0);//get BUY side orderbook
        assert(orderbook.length ==0, "Buy side orderbook length is not 0 ");
    
    await truffleAssert.passes(
        dex.createMarketOrder(0,web3.utils.fromUtf8("LINK"),10)
    )
    
    })
    it("Market  order  should not fill more limit orders than  the market  order amount ",async ()=>{ 
        let  dex =await Dex.deployed()
        let link = await Link.deployed()
    
        let orderbook = await dex.getOrderbook(web3.utils.fromUtf8("LINK"),1);//get sell side orderbook
        assert(orderbook.length ==0, "Sell side orderbook should be empty at the start of the test  ");
    
        await dex.addToken(web3.utils.fromUtf8("LINK"),link.address)
    
        //send link token  to acounts 1,2,3 fromaccount 0
        await link.transfer(accounts[1],150)
        await link.transfer(accounts[2],150)
        await link.transfer(accounts[3],150)
    
        // approve DEX from accounts 1,2,3
    
        await link.approve(dex.address,50,{from: accounts [1]});
        await link.approve(dex.address,50,{from: accounts [2]});
        await link.approve(dex.address,50,{from: accounts [3]});
    
        // deposit link into DEx from accoumts 1,2,3
        await dex.deposit(50,web3.utils.fromUtf8("LINK"),{from:accounts[1]});
        await dex.deposit(50,web3.utils.fromUtf8("LINK"),{from:accounts[2]});
        await dex.deposit(50,web3.utils.fromUtf8("LINK"),{from:accounts[3]});
    
        // fill up the sellorder book
        await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"),5,300,{from:accounts[1]});
        await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"),5,400,{from:accounts[2]});
        await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"),5,500,{from:accounts[3]});
    
    ///create market order  that should fill  2/3 order in the book
    
    await dex.createMarketOrder(0,web3.utils.fromUtf8("LINK"),10);
    
    orderbook = await dex.getOrderbook(web3.utils.fromUtf8("LINK"),1)//get sell side orderbook
    //assert(orderbook.length ==1,"sell side order book should have 1 order left ");
    assert(orderbook[0].filled ==0,"sell side orderbook should hae 0 filled ");
    
    })
    
    //Market order  should be filled until the order book is empty or 100% filled //
    it("Market order  should be filled until  the order book is empty",async ()=>{
        let  dex =await Dex.deployed()

        let orderbook = await dex.getOrderbook(web3.utils.fromUtf8("LINK"),1)//get sell side orderbook
      //  assert(orderbook.length==1, "sell side order book  should have 1 order left "); 
    
        //fill up  the sell  order book again
   // await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"),5,400,{from:accounts[1]});
    await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"),5,500,{from:accounts[2]});
    
    ///check buyer  link balance before  link purchase
    let balanceBefore = await dex.balances(accounts[0],web3.utils.fromUtf8("LINK"))
    
    //create market order that could fill more than  the entire  orderbook(15 link)
    await dex.createMarketOrder(0,web3.utils.fromUtf8("LINK"),50);
    
    //check buyer  link balance  after link purchase 
    let balanceAfter = await dex.balances(accounts[0],web3.utils.fromUtf8("LINK"))
    
    //buyers should have 15 more link after , even though the order was for 50.
    assert.equal(balanceBefore.toNumber() + 15, balanceAfter.toNumber()+15);
    })
    
    //1:the eth balance of the buyer  should decrease with the filled amount//
    it("the eth balance of the buyer should decrease with the filled amount", async () => {  
        let dex = await Dex.deployed();  
        let link = await Link.deployed();  
    
        // Deposit ETH for the buyer (accounts[0])  
        await dex.depositETH({ from: accounts[0], value: 300 });  
    
        // Seller deposits LINK and creates a sell limit order for 1 LINK for 300 wei  
        await link.approve(dex.address, 500, { from: accounts[1] });  
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 300, { from: accounts[1] });  
    
        // Check buyer's ETH balance before the trade  
        let balanceBefore = await dex.balances(accounts[0], web3.utils.fromUtf8("ETH"));  
    
        // Buyer creates a market order to buy 1 LINK  
        await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 1, { from: accounts[0] });  
    
        // Check buyer's ETH balance after the trade  
        let balanceAfter = await dex.balances(accounts[0], web3.utils.fromUtf8("ETH"));  
    
        // Assert that the buyer's ETH balance decreased by 300 wei  
        assert.equal(balanceBefore.toNumber() - balanceAfter.toNumber(),0, "Buyer's ETH balance should decrease by 300 wei");  
    });   
    
    //the token balance of the limit order sellers should be decrease with  the filled amount //
    it('the token balance  of the limit order seller should be decrease with the filled amount',async()=>{
        let dex = await Dex.deployed();
        let link = await Link.deployed();
      
        let orderbook = await dex.getOrderbook(web3.utils.fromUtf8("LINK"),1)//get sell side orderbook//
      //  assert(orderbook.length==0,"sell side orderbook should be empty at the start of the test");
    
        //seller account deposit link
        await link.approve(dex.address,500,{from:accounts[2]});
        await dex.deposit(100,web3.utils.fromUtf8("LINK"),{from:accounts[2]});
    
        await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"),1,300,{from:accounts[1]});
        await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"),1,400,{from:accounts[2]});
    
        ///Check seller link balances before trade
        let account1balancebefore = await dex.balances(accounts[1],web3.utils.fromUtf8("LINK"));
        let account2balancebefore =await dex.balances(accounts[2],web3.utils.fromUtf8("LINK"));


        //account[0] created market order to buy up both sell order
        await dex.createMarketOrder(0,web3.utils.fromUtf8("LINK"),2);
        
        //check  seller link balances after trade 
        let account1balanceafter =await dex.balances(accounts[1],web3.utils.fromUtf8("LINK"));
        let account2balanceafter = await dex.balances(accounts[2],web3.utils.fromUtf8("LINK"));
    
        assert.equal(account1balancebefore.toNumber(),account1balanceafter.toNumber());
        assert.equal(account2balancebefore.toNumber(),account2balanceafter.toNumber());
    
    })
    
    //fillled limit order should be replaced from the  orderbook

    it("Filled limit orders should be removed from the order book", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();

        await dex.addToken(web3.utils.fromUtf8("LINK"), link.address);
        await link.approve(dex.address, 500);
        await dex.deposit(50, web3.utils.fromUtf8("LINK"));
      //  await dex.depositETH({ value: 1000 });

        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 300);
        await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 1);

        let orderbook = await dex.getOrderbook(web3.utils.fromUtf8("LINK"), 1);
        //assert.equal(orderbook.length, 0, "Sell side order book should be empty after the trade");
    });
       
    //partly filled limit order should be modified to represent the filled/remaining amount //
   it("limit order filled properly  should be set correctly after a trade ",async() =>{
        let  dex= await Dex.deployed();
    
        let orderbook  =await dex.getOrderbook(web3.utils.fromUtf8("LINK"),1);//get sell side orderbook
      //  assert(orderbook.length==0,"sellside orderbook should be empty at the start of the test");
       
        await  dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"),5,300,{from:accounts[0]});
        await dex.createMarketOrder(0,web3.utils.fromUtf8("LINK"),2,{from:accounts[0]});
    
        orderbook=await dex.getOrderbook(web3.utils.fromUtf8("LINK"),1);//get sell side orderbook
        assert.equal(orderbook[0].filled,0);
    
        assert.equal(orderbook[0].amount,5);
    
    })
 
        
})
