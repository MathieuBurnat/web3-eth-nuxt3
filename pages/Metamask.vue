<template>
  <div>
    <div class="flex flex-col">
      <div>
        <!-- Connection Button -->
        <div v-if="!instance">
          <button
            class="p-2 m-5 text-green-800 border border-green-500 border-dashed rounded-xl"
            type="button"
            @click="initWeb3"
          >
            Connect to Metamask
          </button>
        </div>
        <div v-else>
          <button
            class="p-2 m-5 text-red-800 border border-red-500 border-dashed rounded-xl"
            type="button"
            @click="disconnectWeb3"
          >
            Disconnect
          </button>
        </div>
      </div>

      <div
        class="p-2 m-5 text-gray-800 border border-gray-500 border-dashed rounded-xl"
      >
        <!-- Information Pannel -->
        <h1 class="py-2 text-xl font-semibold text-center">Informations</h1>
        <div v-if="instance && web3StoreValues.user">
          <p>Network ID : {{ web3StoreValues.user.networkId }}</p>
          <p>Coinbase : {{ web3StoreValues.user.coinbase }}</p>
          <p>Balance : {{ web3StoreValues.user.balance }}</p>
        </div>
        <div v-else>
          <p class="italic text-center text-gray-500">
            Connect yourself to see wallet informations
          </p>
        </div>
      </div>
      <!-- Interaction -->
      <div
        v-if="instance"
        class="p-2 m-5 text-gray-800 border border-gray-500 border-dashed rounded-xl"
      >
        <h1 class="py-2 text-xl font-semibold text-center">Actions</h1>
        <p>Smart Contract value : {{ web3StoreValues.smartContractMessage }}</p>
        <div>
          <label class="font-semibold" for="fname">Write new value</label><br />
          <input
            class="m-2 border border-gray-300 border-dashed"
            v-model="newValue"
          /><br />
        </div>

        <button
          class="p-2 m-5 border border-dashed text-cyan-800 border-cyan-500 rounded-xl"
          type="button"
          @click="interact('read')"
        >
          Read Contract
        </button>

        <button
          class="p-2 m-5 text-purple-800 border border-purple-500 border-dashed rounded-xl"
          type="button"
          @click="interact('write')"
        >
          Write Contract
        </button>
      </div>
      <!-- Error message -->
      <div
        v-if="errorMessage"
        class="p-2 m-5 text-center text-red-800 border border-red-500 border-dashed rounded-xl"
      >
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import Web3 from "web3";
import { get_smart_contract_abi } from "../sources/smart_contract_abi";

import { useWeb3Store } from "~/store/wallet";
import { storeToRefs } from "pinia";

export default {
  name: "Index",
  mounted() {
    this.web3Store = useWeb3Store();
    this.web3StoreValues = storeToRefs(this.web3Store);
  },
  data() {
    return {
      // Store
      web3Store: "",
      web3StoreValues: "",

      // Variables
      errorMessage: "",
      instance: null,
      newValue: "Put your message here",
    };
  },
  methods: {
    increment() {
      this.web3Store.addValueToFilterList(this.inputVal);
    },
    // ...mapMutations("web3", ["registerWeb3Instance"]),
    async initWeb3() {
      // Check for web3 provider
      if (typeof window.ethereum !== "undefined") {
        try {
          // Ask to connect
          await window.ethereum.send("eth_requestAccounts");
          this.instance = new Web3(window.ethereum);

          // Get necessary info on your node
          const networkId = await this.instance.eth.net.getId();
          const coinbase = await this.instance.eth.getCoinbase();
          const balance = await this.instance.eth.getBalance(coinbase);

          // Store user info
          this.web3Store.setUser({
            networkId,
            coinbase,
            balance,
          });

          this.errorMessage = "";
        } catch (error) {
          // User denied account access
          console.error("User denied web3 access", error);
          this.errorMessage =
            "Please connect to your Ethereum address on Metamask before connecting to this website";
          return;
        }
      }
      // No web3 provider
      else {
        console.error("No web3 provider detected");
        this.errorMessage =
          "No web3 provider detected. Did you install the Metamask extension on this browser?";
        return;
      }
    },
    async disconnectWeb3() {
      // Disconnect from Metamask
      this.instance.eth.accounts.wallet.clear();

      // Clear user info
      this.web3Store.clearUser();
      this.instance = null;
    },
    async interact(action) {
      console.log("interact");

      this.account = await this.instance.eth.getAccounts().then((accounts) => {
        console.log(accounts);
        return accounts[0];
      });

      const chainId = await this.instance.eth.getChainId();
      if (chainId != 5) {
        this.errorMessage =
          "You are not on the testnet, please change your network";
        return;
      } else {
        console.log("--- Testnet: OK ---");
      }

      const contract_address = this.$config.SMART_CONTRACT_ADDRESS;
      console.log(contract_address);

      const contract = new this.instance.eth.Contract(
        get_smart_contract_abi(),
        contract_address
      );

      if (action == "read") {
        console.log("======= Call smart contract -> get message ========");
        contract.methods
          .message()
          .call()
          .then((value) => {
            this.web3Store.setSmartContractMessage(value);
          });
      }

      if (action == "write") {
        console.log("======= Call smart contract -> set a message ========");

        const message = this.newValue;

        // create transaction
        const tx_builder = await contract.methods.update(message);
        const encoded_tx = await tx_builder.encodeABI();
        const transactionConfig = {
          data: encoded_tx,
          from: this.account,
          to: contract_address,
        };

        this.instance.eth.sendTransaction(
          transactionConfig,
          function (error, hash) {
            if (!error) {
              console.log(
                "🎉 The hash of your transaction is: ",
                hash,
                "\n Check Alchemy's Mempool to view the status of your transaction!"
              );
            } else {
              console.log(
                "❗Something went wrong while submitting your transaction:",
                error
              );
            }
          }
        );
      }
    },
  },
};
</script>
