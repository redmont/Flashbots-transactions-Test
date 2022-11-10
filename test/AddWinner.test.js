const { providers, Wallet, ethers } = require("ethers");
const {
    FlashbotsBundleProvider,
    FlashbotsBundleResolution,
} = require("@flashbots/ethers-provider-bundle");

const { PRIVATE_KEY, INFURA_RPC_URL, TARGET_CONTRACT_ADDR } = process.env;

const FLASHBOTS_ENDPOINT = "https://relay-goerli.flashbots.net";
const CHAIN_ID = 5;
const GWEI = 10n ** 9n;

const provider = new providers.JsonRpcProvider({
    url: INFURA_RPC_URL,
});

const wallet = new Wallet(PRIVATE_KEY, provider);
console.log("wallet::" + wallet.address);

const signer = new Wallet(PRIVATE_KEY);
console.log("Signer::" + signer.address);

contract("AddWinner", () => {
    let AddWinnerDeployedAddress;
    it("should deploy AddWinner Contract through Flashbots", async () => {
        const AddWinner = artifacts.require("AddWinner");

        const flashbot = await FlashbotsBundleProvider.create(
            provider,
            signer,
            FLASHBOTS_ENDPOINT,
        );

        const result = new Promise((resolve, reject) => {
            provider.on("block", async (block) => {
                console.log(`block: ${block}`);

                const signedTx = await flashbot.signBundle([
                    {
                        signer: wallet,
                        transaction: {
                            chainId: CHAIN_ID,
                            // EIP 1559 transaction
                            type: 2,
                            value: 0,
                            data: AddWinner.bytecode,
                            maxFeePerGas: GWEI * 3n,
                            maxPriorityFeePerGas: GWEI * 2n,
                            gasLimit: 1000000,
                        },
                    },
                ]);

                const targetBlock = block + 1;
                const sim = await flashbot.simulate(signedTx, targetBlock);

                if ("error" in sim) {
                    console.log(`simulation error: ${sim.error.message}`);
                } else {
                    console.log(`simulation success`);
                }

                const res = await flashbot.sendRawBundle(signedTx, targetBlock);
                if ("error" in res) {
                    return reject(res.error.message);
                }

                const bundleResolution = await res.wait();
                if (
                    bundleResolution ===
                    FlashbotsBundleResolution.BundleIncluded
                ) {
                    console.log(`Congrats1, included in ${targetBlock}`);
                    console.log(JSON.stringify(sim, null, 2));

                    const from = wallet.address;
                    const nonce = res.bundleTransactions[0].nonce;
                    AddWinnerDeployedAddress = ethers.utils.getContractAddress({
                        from,
                        nonce,
                    });
                    return resolve(AddWinnerDeployedAddress);
                } else if (
                    bundleResolution ===
                    FlashbotsBundleResolution.BlockPassedWithoutInclusion
                ) {
                    console.log(`Not included in ${targetBlock}`);
                } else if (
                    bundleResolution ===
                    FlashbotsBundleResolution.AccountNonceTooHigh
                ) {
                    console.log("Nonce too high, bailing");
                    return reject(err);
                }
            });
        });
        await result.then(
            (result) => {
                assert.equal(
                    result,
                    AddWinnerDeployedAddress,
                    "Contract deployed on Address:" + AddWinnerDeployedAddress,
                );
            },
            (error) => {
                // As the URL is a valid one, this will not be called.
                console.log("We have encountered an Error!"); // Log an error
                assert.equal(true, false, error);
            },
        );
    });
    it("should call the hack function of AddWinner Contract", async () => {
        console.log("AddWinnerDeployedAddress::" + AddWinnerDeployedAddress);
        console.log("TARGET_CONTRACT_ADDR::" + TARGET_CONTRACT_ADDR);
        if (AddWinnerDeployedAddress == undefined) {
            assert.equal(true, false, "AddWinner not deployed");
        }

        let ABI = ["function hack(address target)"];
        let iface = new ethers.utils.Interface(ABI);
        const data = iface.encodeFunctionData("hack", [TARGET_CONTRACT_ADDR]);

        const flashbot = await FlashbotsBundleProvider.create(
            provider,
            signer,
            FLASHBOTS_ENDPOINT,
        );

        const result = new Promise((resolve, reject) => {
            provider.on("block", async (block) => {
                console.log(`block: ${block}`);

                const signedTx = await flashbot.signBundle([
                    {
                        signer: wallet,
                        transaction: {
                            to: AddWinnerDeployedAddress,
                            chainId: CHAIN_ID,
                            // EIP 1559 transaction
                            type: 2,
                            value: 0,
                            data: data,
                            maxFeePerGas: GWEI * 3n,
                            maxPriorityFeePerGas: GWEI * 2n,
                            gasLimit: 1000000,
                        },
                    },
                ]);

                const targetBlock = block + 1;
                const sim = await flashbot.simulate(signedTx, targetBlock);

                if ("error" in sim) {
                    console.log(`simulation error: ${sim.error.message}`);
                } else {
                    console.log(`simulation success`);
                }

                const res = await flashbot.sendRawBundle(signedTx, targetBlock);
                if ("error" in res) {
                    return reject(res.error.message);
                }

                const bundleResolution = await res.wait();
                if (
                    bundleResolution ===
                    FlashbotsBundleResolution.BundleIncluded
                ) {
                    console.log(`Congrats2, included in ${targetBlock}`);
                    console.log(JSON.stringify(sim, null, 2));

                    return resolve(true);
                } else if (
                    bundleResolution ===
                    FlashbotsBundleResolution.BlockPassedWithoutInclusion
                ) {
                    console.log(`Not included in ${targetBlock}`);
                } else if (
                    bundleResolution ===
                    FlashbotsBundleResolution.AccountNonceTooHigh
                ) {
                    console.log("Nonce too high, bailing");
                    return reject(err);
                }
            });
        });
        await result.then(
            (result) => {
                console.log("9999999");
                assert.equal(
                    result,
                    true,
                    "AddWinner Contract hack function called",
                );
            },
            (error) => {
                // As the URL is a valid one, this will not be called.
                console.log("We have encountered an Error!"); // Log an error
                assert.equal(true, false, error);
            },
        );
    });
});
