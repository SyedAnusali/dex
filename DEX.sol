// SPDX-License-Identifier: MIT  
pragma solidity ^0.8.0;  

import "./Wallet.sol";  

contract Dex is Wallet {  

    // Enum for Side of the order  
    enum Side {  
        BUY,  
        SELL  
    }  

    // Order struct  
    struct Order {  
        uint id;  
        address trader;  
        Side side;  
        bytes32 ticker;  
        uint amount;  
        uint price;  
        uint filled; // Track the filled amount  
    }  

    // Variable to hold next order ID  
    uint public nextOrderID = 0;  

    // Orderbook structure  
    mapping(bytes32 => mapping(uint => Order[])) public Orderbook;  

    // Function to get order book  
    function getOrderbook(bytes32 ticker, Side side) public view returns (Order[] memory) {  
        return Orderbook[ticker][uint(side)];  
    }  

    // Function to create limit order   
    function createLimitOrder(Side side, bytes32 ticker, uint amount, uint price) public {  
        if (side == Side.BUY) {  
            require(balances[msg.sender]["ETH"] >= amount * price, "Not enough ETH");  
        } else if (side == Side.SELL) {  
     //      require(balances[msg.sender][ticker] >= amount, "Not enough tokens");   
        }  

        // Create the order and store it in the Orderbook  
        Order[] storage orders = Orderbook[ticker][uint(side)];  
        orders.push(Order(nextOrderID, msg.sender, side, ticker, amount, price, 0));  
        nextOrderID++;  

        // Logic for maintaining the order book (sorting)  
        uint i = orders.length > 0 ? orders.length - 1 : 0;  
        if (side == Side.BUY) {  
            while (i > 0) {  
                if (orders[i - 1].price > orders[i].price) {  
                    break;  
                }  
                // Swap orders  
                Order memory tempOrder = orders[i - 1];  
                orders[i - 1] = orders[i];  
                orders[i] = tempOrder;  
                i--;  
            }  
        } else if (side == Side.SELL) {  
            while (i > 0) {  
                if (orders[i - 1].price < orders[i].price) {  
                    break;  
                }  
                // Swap orders  
                Order memory tempOrder = orders[i - 1];  
                orders[i - 1] = orders[i];  
                orders[i] = tempOrder;  
                i--;  
            }  
        }  
    }  

    // Function to create a market order  
    function createMarketOrder(Side side, bytes32 ticker, uint amount) public {  
        Order[] storage orders = Orderbook[ticker][uint(side)];  
        uint totalFilled = 0;  
        uint cost = 0;  

        for (uint256 i = 0; i < orders.length && totalFilled < amount; i++) {  
            uint leftToFill = amount - totalFilled; // Remaining amount to fill  
            uint availableToFill = orders[i].amount - orders[i].filled; // Amount available in the current order  
            uint filled;  

            // Determine how much to fill  
            if (availableToFill >= leftToFill) {  
                filled = leftToFill; // Fill the remaining of the market order  
            } else {  
                filled = availableToFill; // Fill as much as is available  
            }  

            totalFilled += filled; // Update total filled  
            orders[i].filled += filled; // Update order filled count  
            
            // Calculate the cost  
            cost += filled * orders[i].price;  

            if (side == Side.BUY) {  
                require(balances[msg.sender]["ETH"] >= cost, "Not enough ETH to cover the purchase");  
                // Transfer ETH from buyer to seller  
                balances[msg.sender]["ETH"] -= cost;   
                balances[orders[i].trader][ticker] += filled; // Transfer tokens from seller to buyer  
                balances[orders[i].trader]["ETH"] += cost; // Transfer ETH to seller  
            } else if (side == Side.SELL) {  
                require(balances[msg.sender][ticker] >= filled, "Not enough tokens to sell");  
                // Update seller's token balance  
                balances[msg.sender][ticker] -= filled; // Update seller's balance  
                balances[msg.sender]["ETH"] += cost; // Send ETH to seller  
                balances[orders[i].trader][ticker] += filled; // Transfer tokens to buyer  
                balances[orders[i].trader]["ETH"] -= cost; // Deduct seller's ETH  
            }  

            // Remove fully filled orders from order book  
            if (orders[i].filled == orders[i].amount) {  
                // If the order is fully filled, remove it  
                delete orders[i]; // Note: Actual removal may require additional logic to maintain order consistency  
            }  
        }  
        // Ensure the market order doesn't overfill  
        require(totalFilled <= amount, "Market order did not fill as expected");  
    }  
//now we have to delete the completely filled order from the  orderbook
function removeFilledOrders(bytes32 ticker, Side side) public {  
    Order[] storage orders = Orderbook[ticker][uint(side)];  
    uint i = 0;  

    while (i < orders.length) {  
        if (orders[i].filled == orders[i].amount) {  
            // Swap with last and pop  
            orders[i] = orders[orders.length - 1];  
            orders.pop();  
            // Don't increment i because we need to check the swapped order now at index i  
        } else {  
            i++;  
        }  
    }  
}  
}  
