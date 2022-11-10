const Verifier = artifacts.require("Verifier");
const { MNEMONIC } = process.env;
const { providers, Wallet, ethers } = require("ethers");

contract("Verifier", (accounts) => {
    it("create a signed message and verify it", async () => {
        const contract = await Verifier.deployed();

        const provider = providers.getDefaultProvider("goerli");
        const mnemonicWallet = Wallet.fromMnemonic(MNEMONIC);
        const wallet = new Wallet(mnemonicWallet.privateKey || "", provider);

        let message = "Deepanshu";

        // Sign the string message
        let flatSig = await wallet.signMessage(message);

        // For Solidity, we need the expanded-format of a signature
        let sig = ethers.utils.splitSignature(flatSig);

        // Call the verifyString function
        let recovered = await contract.verifyString(
            message,
            sig.v,
            sig.r,
            sig.s,
        );

        console.log("message: " + message);
        console.log("Wallet Address: " + wallet.address);
        console.log("Signed message with my wallet: " + flatSig);

        assert.equal(recovered, wallet.address);
    });
});
