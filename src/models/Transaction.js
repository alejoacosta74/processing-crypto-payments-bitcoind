const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose');
//require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;
const Schema = mongoose.Schema;

const txSchema = new Schema ({
    involvesWatchonly:{
        type: Boolean,
        required: true
    },
    account:{
        type: String,
        required: false
    },
    address:{
        type: String,
        required: false
    },
    category:{
        type: String,
        required: true
    },
    amount:{
        type: Decimal128,
        required: true,        
    },
    label:{
        type: String,
        required: false
    },
    confirmations:{
        type: Number,
        required: true
    },
    blockhash:{
        type: String,
        required: true
    },
    blockindex:{
        type: Number,
        required: true
    },
    blocktime:{
        type: Date,
        required: true
    },
    txid:{
        type: String,
        unique: true,
        required: true
    },
    vout:{
        type: Number,
        required: true
    },
    walletconflicts:{
        type: Array,
        required: true
    },
    time:{
        type: Date,
        required: true
    },
    timereceived:{
        type: Date,
        required: true
    },
    'bip125-replaceable':{
        type: String,
        required: true
    },
});

var Transaction = mongoose.model('transactions', txSchema);

module.exports = Transaction;

