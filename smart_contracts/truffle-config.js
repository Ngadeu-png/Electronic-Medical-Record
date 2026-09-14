module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      chainId: 1337,
      from: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
      gas: 6721975,
      gasPrice: 20000000000
    }
  },
  compilers: {
    solc: {
      version: "^0.8.0"
    }
  }
};
