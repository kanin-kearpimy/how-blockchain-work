const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash
    }

    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

class Blockchain {
    constructor() {
        this.chain = [];
    }

    createGenesisBlock() {
        const genesis = new Block(0, new Date(), 'mock-data', '0');
        genesis.hash = genesis.calculateHash()
        this.chain.push(genesis)
    }

    getChainLength() {
        return this.chain.length
    }

    getLastestBlock() {
        return this.chain[this.chain.length - 1]
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLastestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock)
    }

    isChainValid() {
        for(let item = 1; item < this.chain.length; item++) {
            const currentBlock = this.chain[item];
            const previousBlock = this.chain[item - 1];

            if(currentBlock.hash !== currentBlock.calculateHash()) {
                return false
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false
            }
        }

        return true
    }
}

let Chain = new Blockchain();

Chain.createGenesisBlock()
Chain.addBlock(new Block(Chain.getChainLength(), new Date(), 'mock-data-2'))
Chain.addBlock(new Block(Chain.getChainLength(), new Date(), 'mock-data-3'))

console.log('is chain valid? ', Chain.isChainValid())

// Chain.chain[1].data = "mock-data-fake!!!"

console.log('is chain valid? ', Chain.isChainValid())

console.log(JSON.stringify(Chain.chain, null, 4))