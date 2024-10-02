// src/LandRegistry.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import LandRegistryContract from './LandRegistry.json'; // Ensure the path is correct

const LandRegistry = () => {
  const [p_id, setPid] = useState('');
  const [propertyDetails, setPropertyDetails] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [currentOwner, setCurrentOwner] = useState('');
  const [properties, setProperties] = useState([]); // State for storing all properties
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        // Connect to MetaMask
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        // Get the network ID and contract instance
        const networkId = 5777; // Replace with your network ID
        const networkData = LandRegistryContract.networks[networkId];

        if (!networkData) {
          alert('Smart contract not deployed to detected network.');
          return;
        }

        // Create a contract instance
        const landRegistry = new web3.eth.Contract(
          LandRegistryContract.abi,
          networkData.address
        );
        setContract(landRegistry);
      } catch (error) {
        console.error('Error loading blockchain data:', error);
      }
    };

    loadBlockchainData();
  }, []); // Run once on mount

  const registerProperty = async () => {
    if (!contract) {
      alert('Contract is not loaded.');
      return;
    }

    try {
      await contract.methods
        .registerProperty(p_id, account, propertyDetails)
        .send({ from: account });
      console.log('Property registered!');
      setPid('');
      setPropertyDetails('');
      fetchAllProperties(); // Fetch properties after registering a new one
    } catch (error) {
      console.error('Error during registration: ', error);
    }
  };

  const viewProperty = async () => {
    if (!contract) {
      alert('Contract is not loaded.');
      return;
    }

    try {
      // Call the new smart contract function to view property by p_id
      const property = await contract.methods.viewPropertyByPId(p_id).call();
      setCurrentOwner(property[1]); // Update current owner to display
      setPropertyDetails(property[2]);
    } catch (error) {
      console.error('Error retrieving property: ', error);
    }
  };

  const transferProperty = async () => {
    if (!contract) {
      alert('Contract is not loaded.');
      return;
    }

    try {
      // Check if the property exists and if the user is the owner
      const property = await contract.methods.viewPropertyByPId(p_id).call();
      if (property[0] === '') {
        alert('Property does not exist.');
        return;
      }

      if (property[1] !== account) {
        alert("You don't own this property.");
        return;
      }

      await contract.methods
        .transferProperty(p_id, newOwner) // Transfer the property using p_id
        .send({ from: account });
      console.log('Property transferred!');
      setNewOwner('');
      fetchAllProperties(); // Fetch properties after transferring
    } catch (error) {
      console.error('Error during property transfer: ', error);
    }
  };

  const fetchAllProperties = async () => {
    if (!contract) {
      alert('Contract is not loaded.');
      return;
    }

    try {
      const {
        0: ids,
        1: owners,
        2: details,
      } = await contract.methods.getAllProperties().call();

      const allProperties = ids.map((id, index) => ({
        // Assuming p_id is part of id and we want to extract it correctly
        id: id.replace(account, ''), // Extract p_id from the combined id
        owner: owners[index],
        details: details[index],
      }));
      setProperties(allProperties.reverse()); // Update state with all properties
    } catch (error) {
      console.error('Error fetching all properties: ', error);
    }
  };

  return (
    <div>
      <h2>Register Property</h2>
      <input
        type="text"
        placeholder="Original Property ID (p_id)"
        value={p_id}
        onChange={(e) => setPid(e.target.value)}
      />
      <input
        type="text"
        placeholder="Property Details"
        value={propertyDetails}
        onChange={(e) => setPropertyDetails(e.target.value)}
      />
      <button onClick={registerProperty}>Register Property</button>

      <h2>View Property</h2>
      <input
        type="text"
        placeholder="Property ID (p_id)"
        value={p_id}
        onChange={(e) => setPid(e.target.value)}
      />
      <button onClick={viewProperty}>View Property</button>
      {propertyDetails && (
        <div>
          <h3>Property Details:</h3>
          <p>Owner: {currentOwner}</p>
          <p>Details: {propertyDetails}</p>
        </div>
      )}

      <h2>Transfer Property</h2>
      <input
        type="text"
        placeholder="Property ID (p_id)"
        value={p_id}
        onChange={(e) => setPid(e.target.value)}
      />
      <input
        type="text"
        placeholder="New Owner Address"
        value={newOwner}
        onChange={(e) => setNewOwner(e.target.value)}
      />
      <button onClick={transferProperty}>Transfer Property</button>

      <h2>All Properties</h2>
      <ul>
        {properties.map((property, index) => {
          const numericId = property.id.match(/\d+/)?.[0]; // Match one or more digits

          return (
            <li key={index}>
              ID: {numericId}, Owner: {property.owner}, Details:{property.details}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LandRegistry;
