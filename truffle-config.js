const fs = require('fs');
const HDWalletProvider = require('truffle-hdwallet-provider');

const keys = JSON.parse(
    fs.readFileSync('keys.json').toString().trim()
);

module.exports = {
    networks: {
        ropsten: {
            provider: () => 
                new HDWalletProvider(
                    keys.seed,
                    `https://ropsten.infura.io/v3/${keys.projectId}`
                ),
            network_id: 3
        }
    }
};

// For local truffle blockchain
// module.exports = {
//     networks: {
//       development: {
//         host: "127.0.0.1",
//         port: 9545,
//         network_id: "*" // Match any network id
//       }
//     },
//     solc: {
//       optimizer: {
//         enabled: true,
//         runs: 200
//       }
//     }
//   }