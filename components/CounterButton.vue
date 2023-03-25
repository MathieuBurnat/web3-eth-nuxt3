<template>
  <button
    class="p-2 m-5 text-purple-800 border border-purple-500 border-dashed rounded-xl"
    type="button"
    @click="increment(inputVal)"
  >
    {{ filtersList.count }}
  </button>
  <div>
    <p>Filters : {{ filtersList }}.</p>
    <p>Counter : {{ filtersList.count }}.</p>
    <input v-model="inputVal" />
  </div>
</template>

<script>
import { useFiltersStore } from "~/store/filters";
import { storeToRefs } from "pinia";

export default {
  mounted() {
    this.filtersStore = useFiltersStore();
    this.filtersList = storeToRefs(this.filtersStore);
    this.count = storeToRefs(this.filtersStore);
  },
  data() {
    return {
      filtersList: [],
      count: 0,
      filtersStore: "",
      inputVal: "sweet value",
    };
  },
  methods: {
    increment() {
      const { addValueToFilterList } = this.filtersStore;
      addValueToFilterList(this.inputVal);
    },
  },
};
</script>

