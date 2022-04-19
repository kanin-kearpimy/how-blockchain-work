const {Blockchain, Transaction} = require('./blockchain')

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('047c2f011bf308a0e02f2619c041a78bf4c82bbf8696831853606bf2ba41fcbe38d8257251395e38eb362f6988b34c8c23e60e37200c0b4e41b30fb4909f891374')
const myWalletAddress = myKey.getPublic('hex')

let Chain = new Blockchain();
// Chain.createGenesisBlock()

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey)
Chain.addTransaction(tx1)

console.log('\n Starting the miner...')
Chain.minePendingTransactions(myWalletAddress)

console.log('\n Balance of james-address is ', Chain.getBalanceOfAddress(myWalletAddress))