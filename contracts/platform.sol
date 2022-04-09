// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Token.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
//import "@openzeppelin/contracts/utils/Address.sol";

contract Platform is AccessControl{
    //using Address for address;

    address tokenAddress;
    //uint256 lastsalePrice= 10**13;
    uint256 salePrice=10**13;
    uint256 duration; 
    uint256 saleStartTime;
    uint256 tradeStartTime;
    uint256 saleSupply;
    uint256 tradingVolume;

    enum STATUS{
        SELL,
        TRADE,
        FIRSTSTART
    }
    STATUS status;
    struct userRegistration{
        address referal;
        bool registerOrNot;
    }
    struct Order{
        uint256 price;
        uint256 amount;
    }
    mapping(address=>Order) private orders;
    mapping(address=>userRegistration) private users;
    constructor(address token_,uint256 duration_,uint256 salePrice_,uint256 saleSupply_,address admin_)
    {
        tokenAddress=token_;
        //startSaleRound=time_;
        duration=duration_;
        status=STATUS.FIRSTSTART;
        salePrice=salePrice_;
        saleSupply=saleSupply_;
        _setupRole(DEFAULT_ADMIN_ROLE, admin_);
    }
    function salePriceOf() external view returns(uint256){
        return salePrice;
    }
    function tradingVolumeOf() external view returns(uint256){
        return tradingVolume;
    }
    function saleSupplyOf() external view returns(uint256){
        return saleSupply;
    }
    function usersRefOf(address account) external view returns(address){
        return users[account].referal;
    }
    function registrationCheck(address account) external view returns(bool){
        return users[account].registerOrNot;
    }
    function statusOf() external view returns(STATUS){
        return status;
    }
    function orderPriceOf(address account) external view returns(uint256){
        return orders[account].price;
    }
    // if no referal call function with zeroaddress or contract address
    function register(address referal_) external{
        if(referal_==address(0)||referal_==address(this)){
            require(users[msg.sender].registerOrNot==false,"already register");
            users[msg.sender].referal=referal_;
            users[msg.sender].registerOrNot=true;
        }else{
            require(users[referal_].registerOrNot==true,"wrong ref");
            require(users[msg.sender].registerOrNot==false,"already register");
            users[msg.sender].referal=referal_;
            users[msg.sender].registerOrNot=true;
        }
        

    }
    function startSaleRound()external{
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "msg.sender not admin");
        if(status==STATUS.FIRSTSTART)
        {
            saleStartTime=block.timestamp;
            Token(tokenAddress).mint(address(this),saleSupply);
            status=STATUS.SELL;
        }else{
            require(status==STATUS.TRADE,"sale round already started");
            require(block.timestamp-tradeStartTime>=duration,"trade round not end");
            
            saleStartTime=block.timestamp;
            salePrice= salePrice*103/(100)+4*10**12;
            saleSupply=tradingVolume/salePrice;
            tradingVolume=0;
            Token(tokenAddress).mint(address(this),saleSupply);
            status=STATUS.SELL;
        }
    }
    function howMuchToPay(uint256 amount) public returns(uint256)
    {
        return amount*salePrice;
    }
    function buy(uint256 amount) external payable {
        require(saleSupply>=amount,"not enoug tokens to sale");
        require(block.timestamp-saleStartTime<=duration,"sale round end");
        require(msg.value>=amount*salePrice/(10**18),"not enough eth");
        if(users[msg.sender].referal!=address(0)){
            payable(users[msg.sender].referal).transfer(amount*salePrice*5/100/(10**18));
                if(users[users[msg.sender].referal].referal!=address(0))
                    payable(users[users[msg.sender].referal].referal).transfer(amount*salePrice*3/100/(10**18));
        }
        payable(msg.sender).transfer(msg.value-amount*salePrice/(10**18));
        Token(tokenAddress).transfer(msg.sender,amount);
        saleSupply-=amount;
    }
    function startTradeRound()external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "msg.sender not admin");
        require(status==STATUS.SELL,"trade round already started");
        if(saleSupply==0){
            tradeStartTime=block.timestamp;
            status=STATUS.TRADE;
        }else{
            require(block.timestamp-saleStartTime>=duration,"sale round not end");
            tradeStartTime=block.timestamp;
            status=STATUS.TRADE;
            Token(tokenAddress).burn(address(this),saleSupply);
        }
        
    }
    function addOrder(uint256 amount_,uint256 price_) external{
        require(status==STATUS.TRADE,"not trade round");
        require(orders[msg.sender].amount==0,"already added");
        require(Token(tokenAddress).balanceOf(msg.sender)>=amount_,"not enough tokens to order");
        orders[msg.sender].price=price_;
        orders[msg.sender].amount=amount_;
    }
    function removeOrder() external{
        orders[msg.sender].price=0;
        orders[msg.sender].amount=0;
    }
    function redeemOrder(address whichOrder,uint256 amount_) external payable{
        require(status==STATUS.TRADE,"not trade round");
        require(amount_<=orders[whichOrder].amount,"order do not have enough tokens");
        require(msg.value>=amount_*orders[whichOrder].price/orders[whichOrder].amount,"not enough eth");
        if(users[whichOrder].referal==address(0)){
            payable(whichOrder).transfer(amount_*orders[whichOrder].price/orders[whichOrder].amount);
                
        }else{
            if(users[users[whichOrder].referal].referal==address(0)){
                payable(users[whichOrder].referal).transfer(amount_*orders[whichOrder].price*25/1000/orders[whichOrder].amount);
                payable(whichOrder).transfer(amount_*orders[whichOrder].price*975/1000/orders[whichOrder].amount);
            }else{
                payable(users[users[whichOrder].referal].referal).transfer(amount_*orders[whichOrder].price*25/1000/orders[whichOrder].amount);
                payable(users[whichOrder].referal).transfer(amount_*orders[whichOrder].price*25/1000/orders[whichOrder].amount);
                payable(whichOrder).transfer(amount_*orders[whichOrder].price*95/100/orders[whichOrder].amount);
            }
        }
        
        Token(tokenAddress).transferFrom(whichOrder,msg.sender,amount_);
        
        payable(msg.sender).transfer(msg.value-(amount_*orders[whichOrder].price/orders[whichOrder].amount));
        
        tradingVolume+=amount_*orders[whichOrder].price/orders[whichOrder].amount;
        orders[whichOrder].amount = orders[whichOrder].amount-amount_;
    }

} 