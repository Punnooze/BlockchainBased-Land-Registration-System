// src/LandRegistry.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import LandRegistryContract from './LandRegistry.json';
const LandRegistry = () => {
  const [p_id, setPid] = useState('');
  const [propertyDetails, setPropertyDetails] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [currentOwner, setCurrentOwner] = useState('');
  const [properties, setProperties] = useState([]);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [addrss, setAddress] = useState(['', '', '', '', '', '']);
  const [state, setState] = useState('register');
  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = 5777;
        const networkData = LandRegistryContract.networks[networkId];

        if (!networkData) {
          alert('Smart contract not deployed to detected network.');
          return;
        }

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
  }, []);
  const registerProperty = async () => {
    if (!contract) {
      alert('Contract is not loaded.');
      return;
    }

    try {
      await contract.methods
        .registerProperty(p_id, account, propertyDetails, addrss)
        .send({ from: account });
      console.log('Property registered!');
      setPid('');
      setPropertyDetails('');
      // setAddresses('');
      fetchAllProperties();
    } catch (error) {
      console.error('Error during registration: ', error);
    }
  };

  const handleChange = (index, value) => {
    const newAddress = [...addrss];
    newAddress[index] = value;
    setAddress(newAddress);
  };

  const transferProperty = async () => {
    if (!contract) {
      alert('Contract is not loaded.');
      return;
    }

    try {
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
        .transferProperty(p_id, newOwner)
        .send({ from: account });
      console.log('Property transferred!');
      setNewOwner('');
      fetchAllProperties();
    } catch (error) {
      console.error('Error during property transfer: ', error);
    }
  };

  const viewProperty = async () => {
    if (!contract) {
      alert('Contract is not loaded.');
      return;
    }

    try {
      const property = await contract.methods.viewPropertyByPId(p_id).call();
      setCurrentOwner(property[1]);
      setPropertyDetails(property[2]);
      setAddress(property[3]);
    } catch (error) {
      console.error('Error retrieving property: ', error);
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
        3: addressesList,
      } = await contract.methods.getAllProperties().call();

      const allProperties = ids.map((id, index) => ({
        id: id.replace(account, ''),
        owner: owners[index],
        details: details[index],
        addresses: addressesList[index],
      }));
      setProperties(allProperties.reverse());
    } catch (error) {
      console.error('Error fetching all properties: ', error);
    }
  };

  return (
    <>
      <div className="bg-white p-[40px] rounded-xl shadow-md w-[80vw] h-[80vh]">
        <div className="h-[7vh] flex justify-between px-[100px]">
          <button
            onClick={() => setState('register')}
            className={`${
              state === 'register' ? 'bg-slate-200' : ''
            } p-[10px] pb-[5px] rounded-md rounded-b-none text-[20px]`}
          >
            Register Property
          </button>
          <button
            onClick={() => setState('view')}
            className={`${
              state === 'view' ? 'bg-slate-200' : ''
            } p-[10px] pb-[5px] rounded-md rounded-b-none text-[20px]`}
          >
            View Property
          </button>
          <button
            onClick={() => setState('transfer')}
            className={`${
              state === 'transfer' ? 'bg-slate-200' : ''
            } p-[10px] pb-[5px] rounded-md rounded-b-none text-[20px]`}
          >
            Transfer Property
          </button>
          <button
            onClick={() => setState('all')}
            className={`${
              state === 'all' ? 'bg-slate-200' : ''
            } p-[10px] pb-[5px] rounded-md rounded-b-none text-[20px]`}
          >
            All Property
          </button>
        </div>
        <div className="bg-slate-200 h-[62vh] w-full rounded-lg shadow-md p-[50px] pt-[30px]">
          {state === 'register' && (
            <div className="flex flex-col">
              <div className="flex gap-[30px] justify-center items-center">
                <div className="mb-[20px]">
                  <p className="text-[18px] font-semibold mb-[10px]">
                    Enter the Property ID
                  </p>
                  <p className="text-[15px] mb-[10px]">
                    Make sure to use distinct property IDs
                  </p>
                  <input
                    type="text"
                    placeholder="Original Property ID"
                    value={p_id}
                    onChange={(e) => setPid(e.target.value)}
                    className="border-[1px] rounded-md p-[5px] w-[250px] focus:outline-none focus:border-1px focus:border-slate-400 mb-[20px]"
                  />
                  <p className="text-[18px] font-semibold mb-[10px]">
                    Enter the type/name of your property
                  </p>
                  <input
                    type="text"
                    placeholder="Property Details"
                    value={propertyDetails}
                    onChange={(e) => setPropertyDetails(e.target.value)}
                    className="border-[1px] rounded-md p-[5px] w-[250px] focus:outline-none focus:border-1px focus:border-slate-400"
                  />
                </div>
                <div className="w-[600px]">
                  <div className="w-full flex flex-col justify-center items-center mb-[20px]">
                    <p className="text-[18px] font-semibold mb-[10px]">
                      Enter the address
                    </p>
                    <div className="flex gap-[20px]">
                      <div>
                        <p className="text-[15px] my-[5px] mt-[10px]">
                          Address Line 1
                        </p>
                        <input
                          type="text"
                          placeholder="Address Line 1"
                          value={addrss[0]}
                          onChange={(e) => handleChange(0, e.target.value)}
                          className="border-[1px] rounded-md p-[5px] w-[250px] focus:outline-none focus:border-slate-400"
                        />
                      </div>
                      <div>
                        <p className="text-[15px] my-[5px] mt-[10px]">
                          Address Line 2
                        </p>
                        <input
                          type="text"
                          placeholder="Address Line 2"
                          value={addrss[1]}
                          onChange={(e) => handleChange(1, e.target.value)}
                          className="border-[1px] rounded-md p-[5px] w-[250px] focus:outline-none focus:border-slate-400"
                        />
                      </div>
                    </div>
                    <div className="flex gap-[20px]">
                      <div>
                        <p className="text-[15px] my-[5px] mt-[10px]">
                          District
                        </p>
                        <input
                          type="text"
                          placeholder="District"
                          value={addrss[2]}
                          onChange={(e) => handleChange(2, e.target.value)}
                          className="border-[1px] rounded-md p-[5px] w-[250px] focus:outline-none focus:border-slate-400"
                        />
                      </div>
                      <div>
                        <p className="text-[15px] my-[5px] mt-[10px]">State</p>
                        <input
                          type="text"
                          placeholder="State"
                          value={addrss[3]}
                          onChange={(e) => handleChange(3, e.target.value)}
                          className="border-[1px] rounded-md p-[5px] w-[250px] focus:outline-none focus:border-slate-400"
                        />
                      </div>
                    </div>
                    <div className="flex gap-[20px]">
                      <div>
                        <p className="text-[15px] my-[5px] mt-[10px]">
                          Country
                        </p>
                        <input
                          type="text"
                          placeholder="Country"
                          value={addrss[4]}
                          onChange={(e) => handleChange(4, e.target.value)}
                          className="border-[1px] rounded-md p-[5px] w-[250px] focus:outline-none focus:border-slate-400"
                        />
                      </div>
                      <div>
                        <p className="text-[15px] my-[5px] mt-[10px]">
                          Pin Code
                        </p>
                        <input
                          type="text"
                          placeholder="Pin Code"
                          value={addrss[5]}
                          onChange={(e) => handleChange(5, e.target.value)}
                          className="border-[1px] rounded-md p-[5px] w-[250px] focus:outline-none focus:border-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full justify-end flex">
                <button
                  className="bg-slate-300 hover:bg-slate-100 w-[200px] p-[10px] rounded-md"
                  onClick={registerProperty}
                >
                  Register Property
                </button>
              </div>
            </div>
          )}
          {state === 'view' && (
            <div className="flex w-full justify-center gap-[30px]">
              <div className="flex flex-col">
                <p className="text-[18px] font-semibold mb-[20px]">
                  View Property
                </p>
                <input
                  type="text"
                  placeholder="
                Enter the property ID"
                  value={p_id}
                  onChange={(e) => setPid(e.target.value)}
                  className="border-[1px] rounded-md p-[5px] w-[250px] focus:outline-none focus:border-slate-400 mb-[30px]"
                />

                <button
                  className="bg-slate-300 hover:bg-slate-100 w-[200px] p-[10px] rounded-md"
                  onClick={viewProperty}
                >
                  View Property
                </button>
              </div>
              {propertyDetails && (
                <div className="bg-slate-300 rounded-md p-[20px]">
                  <div>
                    <p className="text-[18px] font-bold">Property {p_id}</p>
                    <p>
                      <span className="font-semibold">Owner:</span>{' '}
                      {currentOwner}
                    </p>
                    <p>
                      <span className="font-semibold">Property Name:</span>{' '}
                      {propertyDetails}
                    </p>
                    <p className="font-semibold mt-[10px]">Address</p>
                    <div>
                      <p>{addrss[0]}</p>
                      <p>{addrss[1]}</p>
                      <p>
                        {addrss[2]}, {addrss[3]}
                      </p>
                      <p>
                        {addrss[4]} - {addrss[5]}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {state === 'transfer' && (
            <div>
              <p className="text-[18px] font-semibold mb-[10px]">
                Transfer Property
              </p>
              <div className="w-[60%] flex justify-center gap-[60px] items-center h-[100px]">
                <div>
                  <p className="mb-[10px] text-[15px]">Enter Property ID</p>
                  <input
                    type="text"
                    placeholder="Property ID (p_id)"
                    value={p_id}
                    onChange={(e) => setPid(e.target.value)}
                    className="border-[1px] rounded-md p-[5px] w-[250px] focus:outline-none focus:border-1px focus:border-slate-400 mb-[20px]"
                  />
                </div>
                <div>
                  <p className="mb-[10px] text-[15px]">
                    Enter the MetaMask ID of new owner
                  </p>
                  <input
                    type="text"
                    placeholder="New Owner Address"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="border-[1px] rounded-md p-[5px] w-[250px] focus:outline-none focus:border-1px focus:border-slate-400 mb-[20px]"
                  />
                </div>
              </div>
              <div className="w-full flex justify-end px-[200px]">
                <button
                  className="bg-slate-300 hover:bg-slate-100 w-[200px] p-[10px] rounded-md"
                  onClick={transferProperty}
                >
                  Transfer Property
                </button>
              </div>
            </div>
          )}
          {state === 'all' && (
            <div>
              <p className="text-[20px] font-semibold">All Properties</p>
              <div className="grid grid-cols-3 gap-[20px] h-[370px] overflow-y-scroll p-[20px]">
                {properties.map((property, index) => {
                  const numericId = property.id.match(/\d+/)?.[0];
                  return (
                    <div
                      className="bg-slate-300 rounded-md p-[10px]"
                      key={index}
                    >
                      <p className="text-[18px] font-semibold">
                        Property ID : {numericId}
                      </p>
                      <p className="text-[12px] mt-[5px]">
                        <span className="text-[15px] font-semibold">
                          Owner: <br />{' '}
                        </span>{' '}
                        {property.owner}
                      </p>
                      <p className="text-[15px] mt-[5px]">
                        <span className="text-[15px] font-semibold">
                          Property Name:
                        </span>{' '}
                        {property.details}
                      </p>
                      <p className="text-[15px] font-semibold mt-[5px]">
                        Address:
                      </p>
                      <div>
                        <p className="text-[14px]">{property.addresses[0]}</p>
                        <p className="text-[14px]">{property.addresses[1]}</p>
                        <p className="text-[14px]">
                          {property.addresses[2]}, {property.addresses[3]}
                        </p>
                        <p className="text-[14px]">
                          {property.addresses[4]} - {property.addresses[5]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LandRegistry;
