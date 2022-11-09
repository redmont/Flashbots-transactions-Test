const { BigNumber, providers, Wallet } = require("ethers");
const {
    FlashbotsBundleProvider,
    FlashbotsBundleResolution,
} = require("@flashbots/ethers-provider-bundle");
const { TransactionRequest } = require("@ethersproject/abstract-provider");

const FLASHBOTS_AUTH_KEY = process.env.FLASHBOTS_AUTH_KEY;

const GWEI = BigNumber.from(10).pow(9);
const PRIORITY_FEE = GWEI.mul(3);
const LEGACY_GAS_PRICE = GWEI.mul(12);
const BLOCKS_IN_THE_FUTURE = 2;

// ===== Uncomment this for mainnet =======
// const CHAIN_ID = 1
// const provider = new providers.JsonRpcProvider(
//   { url: process.env.ETHEREUM_RPC_URL || 'http://127.0.0.1:8545' },
//   { chainId: CHAIN_ID, ensAddress: '', name: 'mainnet' }
// )
// const FLASHBOTS_EP = undefined;
// ===== Uncomment this for mainnet =======

// ===== Uncomment this for Goerli =======
const CHAIN_ID = 5;
const provider = new providers.InfuraProvider(
    CHAIN_ID,
    process.env.INFURA_API_KEY,
);
const FLASHBOTS_EP = "https://relay-goerli.flashbots.net/";
// ===== Uncomment this for Goerli =======

async function main() {
    const authSigner = FLASHBOTS_AUTH_KEY
        ? new Wallet(FLASHBOTS_AUTH_KEY)
        : Wallet.createRandom();

    let mnemonic = process.env.MNEMONIC;
    let mnemonicWallet = Wallet.fromMnemonic(
        "make notice genuine fringe home clerk pledge theme need citizen buddy write",
    );
    const wallet = new Wallet(mnemonicWallet.privateKey || "", provider);
    const flashbotsProvider = await FlashbotsBundleProvider.create(
        provider,
        authSigner,
        FLASHBOTS_EP,
        "goerli",
    );

    const tx = {
        from: wallet.address,
        to: "0x727c4AAa462A278eca50e3385766Dd6630AAa28b",
        gasPrice: BigNumber.from(99).mul(1e9),
        gasLimit: BigNumber.from(26210),
        //data: "0x",
        nonce: await provider.getTransactionCount(wallet.address),
    };

    console.log(tx);

    const privateTx = {
        transaction: tx,
        signer: wallet,
    };

    // highest block number your tx can be included in
    const maxBlockNumber = (await provider.getBlockNumber()) + 10;
    // timestamp for simulations
    const minTimestamp = 1645753192;

    const res = await flashbotsProvider.sendPrivateTransaction(privateTx);
    console.log(res);

    console.log(await res.simulate());
    console.log(13131231);
}

main();
