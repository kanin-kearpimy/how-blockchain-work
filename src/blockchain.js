const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Block {
    constructor(timestamp, transaction, previousHash = '') {
        this.timestamp = timestamp;
        this.data = transaction;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash);
    }

    hasValidTransactions() {
        for(const tx of this.data) {
            if(!tx.isValid()){
                return false
            }
        }
        
        return true
    }
}

class Transaction {
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.amount = amount
    }

    calculateHash(){
        return SHA256(this.fromAddress, this.toAddress, this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') != this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!')
        }

        const hashTx = this.calculateHash()
        const signature = signingKey.sign(hashTx, 'base64')
        this.signature = signature.toDER('hex')
    }

    isValid(){
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction')
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
        return publicKey.verify(this.calculateHash(), this.signature)
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return  new Block(new Date(), [], '0');
    }

    getChainLength() {
        return this.chain.length
    }

    getLastestBlock() {
        return this.chain[this.chain.length - 1]
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLastestBlock().hash;
        newBlock.mineBlock(this.difficulty)
        this.chain.push(newBlock)
    }

    minePendingTransactions(miningRewardAddress) {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(new Date(), this.pendingTransactions, this.getLastestBlock().hash)
        block.mineBlock(this.difficulty)

        console.log('Block successfully mined!')
        this.chain.push(block)

        this.pendingTransactions = []
    }

    addTransaction(transaction) {

        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Cannot add invalid transaction to chian')
        }

        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain')
        }

        this.pendingTransactions.push(transaction)
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.data) {
                if(trans.fromAddress === address) {
                    balance -= trans.amount
                }

                if(trans.toAddress === address){
                    balance += trans.amount
                }
            }
        }

        return balance
    }

    isChainValid() {
        for(let item = 1; item < this.chain.length; item++) {
            const currentBlock = this.chain[item];
            const previousBlock = this.chain[item - 1];

            if(!currentBlock.hasValidTransactions()){
                return false
            }

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

module.exports.Blockchain = Blockchain
module.exports.Transaction = Transaction