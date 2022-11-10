const Verifier = artifacts.require("Verifier");
const { MNEMONIC } = process.env;
const { providers, Wallet, ethers } = require("ethers");

contract("Verifier", (accounts) => {
    it("create a signed message and verify it", async () => {
        const contract = await Verifier.deployed();

        const provider = providers.getDefaultProvider("goerli");
        const mnemonicWallet = Wallet.fromMnemonic(MNEMONIC);
        const wallet = new Wallet(mnemonicWallet.privateKey || "", provider);

        let messageHash = ethers.utils.id("Deepanshu Singh");

        let messageHashBytes = ethers.utils.arrayify(messageHash);

        let flatSig = await wallet.signMessage(messageHashBytes);

        console.log("Signature: " + flatSig);

        let sig = ethers.utils.splitSignature(flatSig);

        let recovered = await contract.verifyHash(
            messageHash,
            sig.v,
            sig.r,
            sig.s,
        );

        assert.equal(recovered, wallet.address);
    });
});
