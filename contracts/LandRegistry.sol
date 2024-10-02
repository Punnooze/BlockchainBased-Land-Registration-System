// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LandRegistry {
    struct Property {
        string propertyId;
        string owner;
        string details;
        bool exists;
    }

    mapping(string => Property) private properties;
    string[] private propertyIds; // To keep track of all registered property IDs

    event PropertyRegistered(string propertyId, string owner);
    event PropertyTransferred(string propertyId, string oldOwner, string newOwner);

    function registerProperty(string memory _propertyId, string memory _owner, string memory _details) public {
        require(!properties[_propertyId].exists, "Property already registered");
        
        properties[_propertyId] = Property(_propertyId, _owner, _details, true);
        propertyIds.push(_propertyId); // Add the property ID to the list
        emit PropertyRegistered(_propertyId, _owner);
    }

    function viewProperty(string memory _propertyId) public view returns (string memory, string memory, string memory) {
        require(properties[_propertyId].exists, "Property does not exist");
        
        Property memory property = properties[_propertyId];
        return (property.propertyId, property.owner, property.details);
    }

    function transferProperty(string memory _propertyId, string memory _newOwner) public {
        require(properties[_propertyId].exists, "Property does not exist");
        require(keccak256(abi.encodePacked(properties[_propertyId].owner)) == keccak256(abi.encodePacked(msg.sender)), "Only the owner can transfer the property");
        
        string memory oldOwner = properties[_propertyId].owner;
        properties[_propertyId].owner = _newOwner;
        emit PropertyTransferred(_propertyId, oldOwner, _newOwner);
    }

    // New function to retrieve all registered properties
    function getAllProperties() public view returns (string[] memory, string[] memory, string[] memory) {
        string[] memory ids = new string[](propertyIds.length);
        string[] memory owners = new string[](propertyIds.length);
        string[] memory details = new string[](propertyIds.length);

        for (uint256 i = 0; i < propertyIds.length; i++) {
            Property memory property = properties[propertyIds[i]];
            ids[i] = property.propertyId;
            owners[i] = property.owner;
            details[i] = property.details;
        }

        return (ids, owners, details);
    }
}
