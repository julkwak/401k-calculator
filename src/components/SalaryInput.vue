<!-- Salary and balance input component -->
<template>
  <div>
    <div class="input-group">
      <label>Annual income</label>
      <InputGroup>
        <InputGroupAddon>$</InputGroupAddon>
        <InputNumber 
          v-model="localSalary"
          :useGrouping="true"
          :min="0"
        />
      </InputGroup>
    </div>
    
    <div class="input-group">
      <label>Current 401(k) balance</label>
      <InputGroup>
        <InputGroupAddon>$</InputGroupAddon>
        <InputNumber 
          v-model="localBalance"
          :useGrouping="true"
          :min="0"
        />
      </InputGroup>
    </div>
  </div>
</template>

<script lang="ts">
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputNumber from 'primevue/inputnumber'

export default {
  name: 'SalaryInput',

  components: {
    InputGroup,
    InputGroupAddon,
    InputNumber
  },

  props: {
    annualSalary: {
      type: Number,
      required: true
    },
    currentBalance: {
      type: Number,
      required: true
    }
  },

  emits: ['update:annualSalary', 'update:currentBalance'],

  computed: {
    localSalary: {
      get() {
        return this.annualSalary
      },
      set(value) {
        this.$emit('update:annualSalary', value || 0)
      }
    },

    localBalance: {
      get() {
        return this.currentBalance
      },
      set(value) {
        this.$emit('update:currentBalance', value || 0)
      }
    }
  }
}
</script>