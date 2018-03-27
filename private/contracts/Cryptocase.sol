pragma solidity ^0.4.17;

import './ERC721SmartToken.sol';
import './SaleClockAuction.sol';

contract Cryptocase is ERC721SmartToken("Cryptocase", "CCT") {

    enum State { Created, Prime, Locked, Secondary, Weighing, Liquidate }

    uint256 startPrice;
    mapping (uint256 => address) public weighingAllowedToAddress;       // case ID --> address approved for weighing
    SaleClockAuction public saleAuction;

    // ERC721
    function _createNFT(uint256 _value, string  _metadata, uint256 _kind, address _owner) internal returns (uint) {
        uint256 newCase = super._createNFT(_value, _metadata, _kind, _owner);
        nfts[newCase].state = uint256(State.Created);
        return newCase;
    }

    // Cryptocase
    function Cryptocase() public {
        startPrice = 1 ether;
    }
    function createCase(string _metadata, uint256 _kind) ownerOnly public returns (uint) {
        return _createNFT(startPrice, _metadata, _kind, owner);
    }
}
