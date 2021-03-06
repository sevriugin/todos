pragma solidity ^0.4.18;

import './IOwned.sol';
import './IERC20Adapter.sol';

/*
    Smart Token interface
*/
contract ISmartToken is IOwned, IERC20Adapter {
    function disableTransfers(bool _disable) public;
    function issue(address _to, uint256 _amount) public;
    function destroy(address _from, uint256 _amount) public;
}