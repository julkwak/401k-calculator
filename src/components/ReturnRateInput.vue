<!-- Return rate input component for estimated investment returns -->
<template>
  <div>
    <div class="input-group">
      <label>Estimated return rate</label>
      <InputGroup>
        <InputNumber 
          v-model="localReturn"
          :min="0"
          :max="100"
          :minFractionDigits="0"
          :maxFractionDigits="0"
        />
        <InputGroupAddon>%</InputGroupAddon>
      </InputGroup>
    </div>
  </div>
</template>

<script lang="ts">
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputNumber from 'primevue/inputnumber'

export default {
  name: 'ReturnRateInput',

  components: {
    InputGroup,
    InputGroupAddon,
    InputNumber
  },

  props: {
    averageAnnualReturn: {
      type: Number,
      required: true
    }
  },

  emits: ['update:averageAnnualReturn'],

  computed: {
    localReturn: {
      get() {
        return this.averageAnnualReturn * 100
      },
      set(value) {
        this.$emit('update:averageAnnualReturn', (value || 0) / 100)
      }
    }
  }
}
</script>