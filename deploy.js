// deploy.js
const Web3 = require('web3');
const { abi, evm } = require('./build/contracts/LandRegistry.json'); // Adjust the path if necessary

const web3 = new Web3('http://127.0.0.1:7545'); // Connect to Ganache

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    
    console.log('Deploying the contract from account:', accounts[0]);
    
    const result = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object })
        .send({ gas: '1000000', from: accounts[0] });
    
    console.log('Contract deployed to:', result.options.address);
};

deploy();
