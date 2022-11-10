# teesta-Interview

I have used Flashbots to send 2 private transactions (to bypass ```mempool```)<br><br>
    - First private transaction to create the contract 
      (https://goerli.etherscan.io/tx/0xeb9a680bd52c30babac71a829ac420edd3377109f1e910f226332ddea5257e97) <br>
    - Second private transaction to call the function "hack" of above contract which will make the call to the target contract to add the entry in winners. <br>
      (https://goerli.etherscan.io/tx/0x87a55527bf673301c3ed0cd81fc95a276acb7f74ea89cf58fc3c49a35877cad0)

To send the above 2 private transactions in order to add the entry in ```winners```

Add in ```.env``` file
```
PRIVATE_KEY =''
MNEMONIC=''
INFURA_RPC_URL=''
TARGET_CONTRACT_ADDR=''
```

Run ```truffle test ./test/AddWinner.test.js --migrate-none```

Extra:

To create a signature of name signed by wallet & Verify using contract in ./contracts/Verifier.sol

Add in ```.env``` file
```NAME = ''```

Run ```truffle test ./test/Verifier.test.js```
