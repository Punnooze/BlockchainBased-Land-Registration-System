// src/LandRegistry.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import LandRegistryContract from './LandRegistry.json'; // Ensure the path is correct

const LandRegistry = () => {
  const [propertyId, setPropertyId] = useState('');
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
        .registerProperty(propertyId, account, propertyDetails)
        .send({ from: account });
      console.log('Property registered!');
      setPropertyId('');
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
      const property = await contract.methods.viewProperty(propertyId).call();
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
      await contract.methods
        .transferProperty(propertyId, newOwner)
        .send({ from: account });
      console.log('Property transferred!');
      setNewOwner('');
      fetchAllProperties(); // Fetch properties after transferring
    } catch (error) {
      console.error('Error during property transfer: ', error);
    }
  };

  const deleteProperty = async () => {
    alert('Delete functionality is disabled for immutability. Use reset instead.');
    // This functionality can be adjusted if required
  };

  const resetProperties = async () => {
    if (!contract) {
      alert('Contract is not loaded.');
      return;
    }

    try {
      await contract.methods.resetProperties().send({ from: account });
      console.log('All properties reset!');
      fetchAllProperties(); // Fetch properties after resetting
    } catch (error) {
      console.error('Error during reset: ', error);
    }
  };

  const fetchAllProperties = async () => {
    if (!contract) {
      alert('Contract is not loaded.');
      return;
    }

    try {
      const { 0: ids, 1: owners, 2: details } = await contract.methods.getAllProperties().call();
      const allProperties = ids.map((id, index) => ({
        id,
        owner: owners[index],
        details: details[index],
      }));
      setProperties(allProperties); // Update state with all properties
    } catch (error) {
      console.error('Error fetching all properties: ', error);
    }
  };

  return (
    <div>
      <h2>Register Property</h2>
      <input
        type="text"
        placeholder="Property ID"
        value={propertyId}
        onChange={(e) => setPropertyId(e.target.value)}
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
        placeholder="Property ID"
        value={propertyId}
        onChange={(e) => setPropertyId(e.target.value)}
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
        placeholder="New Owner Address"
        value={newOwner}
        onChange={(e) => setNewOwner(e.target.value)}
      />
      <button onClick={transferProperty}>Transfer Property</button>

      <h2>Reset Properties</h2>
      <button onClick={resetProperties}>Reset All Properties</button>

      <h2>All Registered Properties</h2>
      <button onClick={fetchAllProperties}>Fetch All Properties</button>
      {properties.length > 0 && (
        <ul>
          {properties.map((property) => (
            <li key={property.id}>
              {property.id} - Owner: {property.owner} - Details: {property.details}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LandRegistry;
