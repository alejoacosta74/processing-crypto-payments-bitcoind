# Bitcoin daemon RPC TX deposit validation

<img alt="MongoDB" src ="https://img.shields.io/badge/MongoDB-%234ea94b.svg?&style=for-the-badge&logo=mongodb&logoColor=white"/>

<img alt="Docker" src="https://img.shields.io/badge/docker%20-%230db7ed.svg?&style=for-the-badge&logo=docker&logoColor=white"/>

<img alt="NodeJS" src="https://img.shields.io/badge/node.js%20-%2343853D.svg?&style=for-the-badge&logo=node.js&logoColor=white"/>

## About

This project implements a solution that reads **deposit transactions** from bitcoind’s rpc call `listsinceblock`, filters and store them in a database for later usage.

## Assumptions

A deposit will be considered valid when the transaction's attributes match the following criteria:

- `"category"` of type `"receive"`
- `"amount"`  greater than zero (a TX with 'amount == 0' has not been considered as a valid deposit)
- `"confirmations"` equal or greater than 6

## Considerations

- Only **unique** transactions are stored in the database.
- When reading transactions from files `transactions-1.json` and `transactions-2.json`, if the transaction already exists in the database, the duplicated transaction is discarded. 
- Floating type is used to store the `amount` attribute in the database, in order to handle values up to 8 decimals.

## Tools and dependencies

This project is implemented in *javascript* with *Node.js* and *MongoDb / Mongoose*


## Requirements

Docker Engine must be installed on local machine

## Usage

```bash
$ clone https://github.com/alejoacosta74/processing-crypto-payments-bitcoind.git bitcoind-deposit-filter
$ cd bitcoind-deposit-filter
$ docker-compose up --build
```

## Expected output

```bash
Deposited for Wesley Crusher: count=35 sum=217.00000000
Deposited for Leonard McCoy: count=15 sum=64.00000000
Deposited for Jonathan Archer: count=18 sum=99.69000000
Deposited for Jadzia Dax: count=11 sum=55.13000000
Deposited for Montgomery Scott: count=24 sum=108.04593000
Deposited for James T. Kirk: count=27 sum=1267.00848015
Deposited for Spock: count=14 sum=688.88081478
Deposited without reference: count=167 sum=3453.79101076
Smallest valid deposit: 0.00000010
Largest valid deposit: 99.49379661
```