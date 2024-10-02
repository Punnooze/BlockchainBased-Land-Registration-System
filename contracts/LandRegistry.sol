// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LandRegistry {
    struct Property {
        string propertyId; // Combination of p_id and owner address
        string p_id;       // Original property ID
        address owner;     // Current owner's address
        string details;    // Property details
        string[] addresses; // Array of additional addresses as strings
        bool exists;       // Indicates if the property exists
    }

    mapping(string => Property) private properties;
    string[] private propertyIds; // To keep track of all registered property IDs
    mapping(string => bool) private registeredPIds; // Track registered p_ids to ensure uniqueness

    event PropertyRegistered(string propertyId, address owner);
    event PropertyTransferred(string propertyId, address oldOwner, address newOwner);

    // Function to register a property
    function registerProperty(string memory _p_id, address _owner, string memory _details, string[] memory _addresses) public {
        require(!registeredPIds[_p_id], "Property ID already registered");

        string memory propertyId = string(abi.encodePacked(_p_id, _owner));
        properties[propertyId] = Property(propertyId, _p_id, _owner, _details, _addresses, true);
        propertyIds.push(propertyId);
        registeredPIds[_p_id] = true; // Mark p_id as registered

        emit PropertyRegistered(propertyId, _owner);
    }

    // New function to view property by p_id
    function viewPropertyByPId(string memory _p_id) public view returns (string memory, address, string memory, string[] memory) {
        // Loop through propertyIds to find the latest entry for the given p_id
        for (uint256 i = propertyIds.length; i > 0; i--) {
            Property memory property = properties[propertyIds[i - 1]];
            if (keccak256(abi.encodePacked(property.p_id)) == keccak256(abi.encodePacked(_p_id))) {
                return (property.propertyId, property.owner, property.details, property.addresses);
            }
        }
        revert("Property does not exist");
    }

    // Function to transfer property ownership
    function transferProperty(string memory _p_id, address _newOwner) public {
        // Construct the current property ID based on p_id and caller's address
        string memory currentPropertyId = string(abi.encodePacked(_p_id, msg.sender));
        
        // Check if the property exists and if the current user is the owner
        require(properties[currentPropertyId].exists, "Property does not exist");
        require(properties[currentPropertyId].owner == msg.sender, "Only the owner can transfer the property");

        // Create a new property ID for the new owner
        string memory newPropertyId = string(abi.encodePacked(_p_id, _newOwner));
        
        // Transfer the property by creating a new entry for the new owner
        properties[newPropertyId] = Property(newPropertyId, _p_id, _newOwner, properties[currentPropertyId].details, properties[currentPropertyId].addresses, true);
        propertyIds.push(newPropertyId);

        // Emit the transfer event
        emit PropertyTransferred(currentPropertyId, msg.sender, _newOwner);
    }

    // Function to retrieve all registered properties
    function getAllProperties() public view returns (string[] memory, address[] memory, string[] memory, string[][] memory) {
        string[] memory ids = new string[](propertyIds.length);
        address[] memory owners = new address[](propertyIds.length);
        string[] memory details = new string[](propertyIds.length);
        string[][] memory addressesList = new string[][](propertyIds.length);

        for (uint256 i = 0; i < propertyIds.length; i++) {
            Property memory property = properties[propertyIds[i]];
            ids[i] = property.propertyId;
            owners[i] = property.owner;
            details[i] = property.details;
            addressesList[i] = property.addresses; // Add addresses to the return
        }

        return (ids, owners, details, addressesList);
    }
}
