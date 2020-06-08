// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./IERC721.sol";

contract VintageCar is IERC721 {
    // state variables
    // token ->  owner
    mapping(uint256 => address) private tokenOwner;
    //  owner -> token value
    mapping(address => uint256) private tokenOwnerBalance;
    // approve token address
    mapping(uint256 => address) private approvedToken;
    // spender token address (true/false)
    mapping(address => mapping(address => bool)) private operators;

    address private owner;
    string private _name;
    string private _symbol;
    uint256 private _tokenIncrement;

    constructor(string memory name, string memory symbol) public {
        owner = msg.sender;
        _name = name;
        _symbol = symbol;
        _tokenIncrement = 0;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }
    
    function balanceOf(address _owner) public view override returns (uint256) {
        return tokenOwnerBalance[_owner];
    }

    function ownerOf(uint256 _tokenId) public view override returns (address) {
        address _owner = tokenOwner[_tokenId];
        require(_owner != address(0), "VintageCar: invalid token");
        return _owner;
    }

    function approve(address _approved, uint256 _tokenId) public override payable {
         _approve(_approved, _tokenId);
    }

    function setApprovalForAll(address _operator, bool _approved) public override {
        _setApprovalForAll(_operator, _approved);
    }

    function getApproved(uint256 _tokenId) public override view returns (address) {
        require(tokenOwner[_tokenId] != address(0),  "VintageCar: token is not valid");
        return  approvedToken[_tokenId];
    }

    function isApprovedForAll(address _owner, address _operator) public override view returns (bool) {
        return  operators[_owner][_operator];
    }

    function transferFrom(address _from, address _to, uint256 _tokenId)  public override payable {
        _transferFrom(_from, _to, _tokenId);
    }

    function _approve(address _approved, uint256 _tokenId) internal {
        address _owner = tokenOwner[_tokenId];
        require(_owner != address(0),  "VintageCar: token is not valid");
        require(msg.sender == _owner || operators[_owner][msg.sender] , "VintageCar: Only owner or operator address");
        require(_approved != _owner, "VintageCar: approved different of owner"); 
        approvedToken[_tokenId] = _approved;
        emit Approval(_owner, _approved, _tokenId);
    }

    function _setApprovalForAll(address _operator, bool _approved) internal {
       operators[msg.sender][_operator] = _approved;
       emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    function _transferFrom (address _from, address _to, uint256 _tokenId) internal {
       address _owner = tokenOwner[_tokenId];
        require(_owner != address(0), "VintageCar: invalid token");
        require(msg.sender == _owner || 
                operators[_owner][msg.sender] || 
                approvedToken[_tokenId] == msg.sender, 
                "VintageCar: Only owner, operator or approved address");
        require(_from == tokenOwner[_tokenId],  "VintageCar: transfer is not owner of the token");
        require(_to != address(0), "VintageCar: Invalid transfer to address zero"); 
        
        if (approvedToken[_tokenId] != address(0)) {
            delete approvedToken[_tokenId];
        }
        require(tokenOwnerBalance[_to] + 1 > tokenOwnerBalance[_to], "VintageCar: Overflow");
        tokenOwnerBalance[_from] = tokenOwnerBalance[_from] - 1;
        tokenOwner[_tokenId] = _to;
        tokenOwnerBalance[_to] = tokenOwnerBalance[_to] + 1;
        
        _tokenIncrement = _tokenIncrement + 1; 
        emit Transfer(_from, _to, _tokenId);
    }

    function tokenIncrement() public view returns (uint256) {
        return _tokenIncrement;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "VintageCar: Only owner");
        _;
    }
    
    function mint(address _to, uint256 _tokenId) public onlyOwner {
        require(_to != address(0), "VintageCar: Invalid address for Vintage Car");
        require(tokenOwnerBalance[_to] + 1 > tokenOwnerBalance[_to], "VintageCar: Overflow");
        tokenOwner[_tokenId] = _to;
        tokenOwnerBalance[_to] = tokenOwnerBalance[_to] + 1;
        _tokenIncrement = _tokenIncrement + 1; 
        emit Transfer(address(0), _to, _tokenId);
    }
    
}