pragma solidity ^0.4.17;

contract Cryptocase {
     
    address public owner;       // Smart contract owner
    address public holder;      // Cryptocase holder 
    address public buyer;       // Cryptocase buyer

    uint    public value;       // Cryptocase value / price
    bytes32 public url_img;     // URL for the cryptocase image

    enum State { Created, Sale, Locked }
    State public state;
      
    function Cryptocase(bytes32 _url_img) public {
        owner = msg.sender;
        holder = msg.sender;
        url_img = _url_img;
        state = State.Created;
    }

    modifier condition(bool _condition) {
        require(_condition);
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyHolder() {
        require(msg.sender == holder);
        _;
    }

    modifier onlyBuyer() {
        require(msg.sender == buyer);
        _;
    }

    modifier inState(State _state) {
        require(state == _state);
        _;
    }

    event Aborted();
    event Confirmed();
    event Placed(address buyer, uint amount);
    event Canceled();

    function Sale (uint price)
        public
        onlyHolder
        inState(State.Created)
    {
        value = price;
        state = State.Sale;
    }

    function Order()
        public
        condition(msg.value == ((value * 12)/10)) 
        inState(State.Sale)
        payable
    {
        Placed(msg.sender, msg.value);

        buyer = msg.sender;
        state = State.Locked;
    }

    function Confirm()
        public
        inState(State.Locked)
        condition(value == ((this.balance * 12)/10)) 
        onlyOwner
    {
        Confirmed();
        
        holder.transfer(value);
        owner.transfer(this.balance - value);

        holder = buyer;
        state = State.Created;
    }

    function Abort()
        public
        inState(State.Locked)
        onlyOwner        
    {
        Aborted();

        buyer.transfer(this.balance);
        state = State.Created;
    }

    function Cancel()
        public
        inState(State.Locked)
        onlyBuyer
    {
        Canceled();

        buyer.transfer(this.balance);
        state = State.Created;
    }
}
