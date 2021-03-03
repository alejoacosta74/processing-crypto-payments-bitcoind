const fs = require('fs');
const mongoose = require('mongoose');
const JSONStream = require('JSONStream');
const Transaction = require('./src/models/Transaction');
const config = require('./config.json');
const accounts = require('./accounts.json');
const Bluebird = require('bluebird');
var logger = require("./src/logger").Logger;
const MONGODB_URI = process.env.MONGODB_URI || config.MONGODB_URI ;   

mongoose.Promise = Bluebird;

const kraken = async () => {
    try{
        logger.info('Starting kraken challenge');        
        await mongoose.connect(MONGODB_URI, { poolSize: config.DB_POOL_SIZE });        
        logger.info('Step1: Connecting to database');
        db = mongoose.connection;                
        logger.info('Step2: Loading file transactions-1.json');
        await loadDB('transactions-1.json');        
        logger.info('Step3: Loading file transactions-2.json');
        await loadDB('transactions-2.json');
        logger.info('Step4: Calculating credits: ');
        await calculateCreditFor(accounts.WESLEY);
        await calculateCreditFor(accounts.LEONARD);                
        await calculateCreditFor(accounts.JONHATAN);
        await calculateCreditFor(accounts.JADZIA);
        await calculateCreditFor(accounts.MONTGOMERY);
        await calculateCreditFor(accounts.JAMES);
        await calculateCreditFor(accounts.SPOCK);
        await depositsWithoutReference();
        await smallestDeposit();
        await largestDeposit();        
        logger.info('Step5: Closing database');
        await Transaction.collection.drop('transactions');
        db.close();
        logger.info('Challenge finished. For errors, check file ./logs/error.txt');
    }
    catch (err) {        
        logger.error(err.stack);
    }

}

const loadDB = (filename) => {        
    const dataStreamFromFile = fs.createReadStream(`${__dirname}/${filename}`);
    return new Promise((resolve, reject) => {
        let count=0, result, arrayOfTx = [];
        dataStreamFromFile.pipe(JSONStream.parse(['transactions', /./])).on('data', async (txData) => {
            arrayOfTx.push(txData);        
            if (arrayOfTx.length === config.BATCH_INSERT_VALUE) {
              dataStreamFromFile.pause();
              try {
                result = await Transaction.insertMany(arrayOfTx, { ordered: false });                
                count += result.length;
              }
              catch (error){                  
                  logger.error("Error inserting TX document into database\n" + error.writeErrors);                  
                  count += error.insertedDocs.length;
              }
              arrayOfTx = [];              
              dataStreamFromFile.resume();
            }
        });        
        dataStreamFromFile.on('end', async () => {
        try{
            result = await Transaction.insertMany(arrayOfTx, { ordered: false }); 
            count += result.length;
        }catch (error){                        
            logger.error("Error inserting TX document into database\n" + error.writeErrors);                              
            count += error.insertedDocs.length;        }     
        resolve('Finished loading tx file');
        });  
        dataStreamFromFile.on("error", error => reject(error));    
    });
}

const calculateCreditFor = async (customer) =>{    
    let txArray = await (Transaction.find({'address' : `${customer.address}`}));     
    let creditCount=0, creditSum=0; 
    for (i=0; i < txArray.length ; i++){        
        if (txArray[i].confirmations >= 6 && txArray[i].category == "receive" && parseFloat(txArray[i].amount.toString()) > 0){
            creditCount += 1;
            creditSum += parseFloat(txArray[i].amount.toString());
        }
    }
    console.log(`Deposited for ${customer.name}: count=${creditCount} sum=${creditSum.toFixed(8)}`);    
    logger.info(`Deposited for ${customer.name}: count=${creditCount} sum=${creditSum.toFixed(8)}`);    
}

const depositsWithoutReference = async () =>{    
    const knownAddressArray = [
        "mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ",
        "mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp",
        "mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n",
        "2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo",
        "mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8",
        "miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM",
        "mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV"
    ]
    let allTxsArray = await (Transaction.find({ $and: [{confirmations : {$gte: 6}}, {category : "receive"}]}));     
    let creditCount=0, creditSum=0; 
    for (i=0; i < allTxsArray.length ; i++){        
        if (!knownAddressArray.includes(allTxsArray[i].address && parseFloat(allTxsArray[i].amount.toString()) > 0)){
            creditCount += 1;            
            creditSum += parseFloat(allTxsArray[i].amount.toString());
        }
    }
    console.log(`Deposited without reference: count=${creditCount} sum=${creditSum.toFixed(8)}`);    
    logger.info(`Deposited without reference: count=${creditCount} sum=${creditSum.toFixed(8)}`);    
}

const smallestDeposit = async () =>{    
    let tx = await (Transaction.find({ $and: [{confirmations : {$gte: 6}}, {category : "receive"}, {amount : {$gt: 0}}]}).sort({ "amount" : 1 }).limit(1));         
    console.log('Smallest valid deposit:', parseFloat(tx[0].amount.toString()).toFixed(8));    
    logger.info('Smallest valid deposit:', parseFloat(tx[0].amount.toString()).toFixed(8));    
}
const largestDeposit = async () =>{    
    let tx = await (Transaction.find({ $and: [{confirmations : {$gte: 6}}, {category : "receive"}, {amount : {$gt: 0}}]}).sort({ "amount" : -1 }).limit(1));         
    console.log('Largest valid deposit:', parseFloat(tx[0].amount.toString()).toFixed(8));        
    logger.info('Largest valid deposit:', parseFloat(tx[0].amount.toString()).toFixed(8));        
}

kraken();