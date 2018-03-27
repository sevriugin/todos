pragma solidity ^0.4.18;

import './ISmartToken.sol';
import './IERC20Adapter.sol';

/*
    Smart Token Adapter interface
*/
contract ISmartTokenAdapter is ISmartToken {
    function issueTo(address _to, uint256 _toId, uint256 _amount) public;
    function destroyFrom(address _from, uint256 _fromId, uint256 _amount) public;
}