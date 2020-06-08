const BigNumber = require("bignumber.js");
const truffleAssert = require("truffle-assertions");
const VintageCar = artifacts.require("./VintageCar");

contract("VintageCar", (accounts) => {
  const tokenNameExpected = "Vintage Car";
  const tokenSymbolExpected = "VCAR";
  const addrZero = "0x0000000000000000000000000000000000000000"; 
  const creator = accounts[0];
  const collector1 = accounts[1];
  const car1 = 1;
  const car2 = 2;
  const collector2 = accounts[3];

  let vintageCarInstance;
 
  beforeEach(async () => {    
    vintageCarInstance = await VintageCar.new("Vintage Car", "VCAR");
  });

  it("Test name and symbol", async () => {
    const name = await vintageCarInstance.name.call();
    const symbol = await vintageCarInstance.symbol.call();
    
    assert.equal(
      name, 
      tokenNameExpected, 
      "Token is not as expected");
    assert.equal(
      symbol,
      tokenSymbolExpected,
      "Token symbol is not as expected"
    );
  });

  it("Test balanceOf()", async () => {
    let tokenBalance = await vintageCarInstance.balanceOf(collector1);
    tokenBalance = web3.utils.toBN(tokenBalance);
    assert.
      equal (
      new BigNumber(tokenBalance), 0, "The initial balance should be zero"
    );
 
    const tx1 = await vintageCarInstance.mint(collector1, car1, 
    { from: creator });

    truffleAssert.eventEmitted(tx1, "Transfer" , (obj) => {
      return (
        obj._from === addrZero &&
        obj._to   === collector1 &&
        new BigNumber(car1).isEqualTo(obj._tokenId)
      );
    }, "Incorrect mint car1 to collector1");

    tokenBalance = await vintageCarInstance.tokenIncrement();
    tokenBalance = web3.utils.toBN(tokenBalance);
    assert.
      equal(new BigNumber(tokenBalance), 1, 
      "Current token increment should be 1"
    );

    const tx2 = await vintageCarInstance.mint(collector1, car2,
      { from: creator });

    truffleAssert.eventEmitted(tx2, "Transfer" , (obj) => {
      return (
        obj._from === addrZero &&
        obj._to   === collector1 &&
        new BigNumber(car2).isEqualTo(obj._tokenId)
      );
    }, "Incorrect mint car2 to collector1");

    tokenBalance = await vintageCarInstance.tokenIncrement();
    tokenBalance = web3.utils.toBN(tokenBalance);
    assert.
      equal(new BigNumber(tokenBalance), 2, 
      "Current token increment should be 2"
    );
  });

  it("Test ownerOf()", async () => {
    await vintageCarInstance.mint(collector1, car1,
      { from: creator });
    tokenBalance =  await vintageCarInstance.balanceOf(collector1);
    assert.
      equal(tokenBalance, 1, 
      "Balance shoud be 1"
    );

    let ownerAddr = await vintageCarInstance.ownerOf(car1);
    assert.
        equal(ownerAddr, collector1, 
        "Owner should be collector1"
    ) 
  }); 
  
  it("Approve transfer token", async () => {
    const tx1 = await vintageCarInstance.mint(collector1, car1, 
    { from: creator });

    truffleAssert.eventEmitted(tx1, "Transfer", (obj) => {
      return ( 
        obj._from === addrZero &&
        obj._to === collector1 &&
        new BigNumber(car1).isEqualTo(obj._tokenId)
      );
    }, "Incorrect mint car1 to collector1");

    const tx2 = await vintageCarInstance.approve(collector2, car1,
      { from: collector1 });
  
      truffleAssert.eventEmitted(tx2, "Approval", (obj) => {
        return ( 
          obj._owner === collector1 &&
          obj._approved === collector2 &&
          new BigNumber(car1).isEqualTo(obj._tokenId)
        );
      }, "Incorrect Approval event: car1 from collector1 to colector2");

    const apprAddr = await vintageCarInstance.getApproved(car1);
    assert.
      equal(apprAddr, collector2,
      "Approved address should be collector2" 
    );
  }); 
  
  it("Approve operator", async () => {
    const tx1 = await vintageCarInstance.mint(collector1, car1,
      { from: creator });
    
    truffleAssert.eventEmitted(tx1, "Transfer", (obj) => {
      return ( 
        obj._from === addrZero &&
        obj._to === collector1 &&
        new BigNumber(car1).isEqualTo(obj._tokenId)
      );
    }, "Incorrect mint car1 to collector1");

    const tx2 = await vintageCarInstance.setApprovalForAll(collector2, true, 
      { from: collector1 });

    truffleAssert.eventEmitted(tx2, "ApprovalForAll", (obj) => {
      return (
        obj._owner === collector1 &&
        obj._operator === collector2 &&
        obj._approved === true
      );
    }, "Incorrect setApprovalForAll from collector1 to collector2");

    const isAppr = await vintageCarInstance.isApprovedForAll(collector1,collector2);
    assert.
        equal(isAppr, true, collector1, collector2, 
        "collector1 should be approved operator to collector2"
    );
  });
  it("Transfer accounts", async ()=> {
    const tx1 = await vintageCarInstance.mint(collector1, car1,
      { from: creator });
    
    truffleAssert.eventEmitted(tx1, "Transfer", (obj) => {
      return (
          obj._from === addrZero &&
          obj._to === collector1 &&
          new BigNumber(car1).isEqualTo(obj._tokenId)
        );
      }, "Incorrect mint car1 to collector1"); 
     
    let transfAddr = await vintageCarInstance.ownerOf(car1);
    assert.
        equal(transfAddr, collector1, 
        "collector1 should be owner car1"
    );

    const tx2 = await vintageCarInstance.transferFrom(collector1, collector2, car1,
      { from: collector1 });
      
    truffleAssert.eventEmitted(tx1, "Transfer", (obj) => {
      return ( 
        obj._from === addrZero &&
        obj._to === collector1 &&
        new BigNumber(car1).isEqualTo(obj._tokenId)
      );
    }, "Incorrect transfer car1 from collector1");

    transfAddr = await vintageCarInstance.ownerOf(car1);
    assert.
        equal(transfAddr, collector2, 
        "collector2 should be new owner car1"
    );

    let tokenBalance = await vintageCarInstance.balanceOf(collector1);
    tokenBalance = web3.utils.toBN(tokenBalance);
    assert.
       equal(new BigNumber(tokenBalance), 0, 
      "Balance of collector1 should be 0"
    );  

    tokenBalance = await vintageCarInstance.balanceOf(collector2);
    tokenBalance = web3.utils.toBN(tokenBalance);
    assert.
       equal(new BigNumber(tokenBalance), 1, 
      "Balance of collector2 should be 1"
    );  
  }) 
});