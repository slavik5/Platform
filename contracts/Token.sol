//contracts/Token.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
//import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Token is AccessControl {

    uint256 private totalBalance;
    mapping(address => mapping(address => uint256)) private allow;
    mapping(address => uint256) balance;
    string private _name = "SlavkaToken";
    string private _symbol = "ST";
    uint8 private _decimals = 18;
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        mint(msg.sender, 10000 * 10 ** decimals());
    }

    function name() public view returns(string memory) {
        return _name;
    }

    function symbol() public view returns(string memory) {
        return _symbol;
    }

    function decimals() public view returns(uint8) {
        return _decimals;
    }

    function balanceOf(address account) public view returns(uint256) {
        return balance[account];
    }

    function totalSupply() public view returns(uint256) {
        return totalBalance;
    }

    function transfer(address to, uint256 amount) public returns(bool) {
        require(to != address(0), "zero address");
        require(balance[msg.sender] >= amount, "not enough tokens");
        balance[to] += amount;
        balance[msg.sender] -= amount;
        emit Transfer(msg.sender, to, amount);
        return true;

    }

    function allowance(address from, address spender) public view returns(uint256) {
        return allow[from][spender];
    }

    function approve(address spender, uint256 amount) public returns(bool) {
        require(spender != address(0), "spender- zero address");

        allow[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns(bool) {
        require(to != address(0), "to-zero address");
        require(from != address(0), "from- zero address");
        require(balance[from] >= amount, "not enough tokens on balance");
        require(allow[from][msg.sender] >= amount, "not enough tokens on allowance");
        balance[to] += amount;
        balance[from] -= amount;
        allow[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 amount) public returns(bool) {
        require(spender != address(0), "spender - zero address");
        allow[msg.sender][spender] += amount;
        emit Approval(msg.sender, spender, amount);
        return true;

    }

    function decreaseAllowance(address spender, uint256 amount) public returns(bool) {
        require(spender != address(0), "spender - zero address");
        require(allow[msg.sender][spender] >= amount, "not enough for allowance");
        allow[msg.sender][spender] -= amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function mint(address account, uint256 amount) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "msg.sender not owner");
        require(account != address(0), "account - zero address");
        totalBalance += amount;
        balance[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function burn(address account, uint256 amount) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "msg.sender not owner");
        require(account != address(0), "account - zero address");
        require(balance[account] >= amount, "not enough tokens on account");
        totalBalance -= amount;
        balance[account] -= amount;
        emit Transfer(account, address(0), amount);

    }
    event Transfer(address indexed from, address indexed to, uint256 _value);
    event Approval(address indexed from, address indexed spender, uint256 amount);

}