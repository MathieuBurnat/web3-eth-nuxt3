// store/wallet.ts
import { defineStore } from 'pinia'

export const useWeb3Store = defineStore('walletStore', () => {
  const user = ref(Object)
  const smartContractMessage = ref("")

  function setUser(value) {
    user.value = value;
  }

  function clearUser() {
    user.value = null;
  }

  function setSmartContractMessage(value) {
    smartContractMessage.value = value;
  }
  return { setUser, clearUser, setSmartContractMessage, smartContractMessage, user }
})
