<!-- Contribution input component with percentage or dollar amount modes -->
<template>
  <div>
    <div v-if="contributionType === 'percentage'">
      <div class="input-group">
        <label>Contribution percentage</label>
        <InputGroup>
          <InputNumber 
            v-model="localPercentage"
            :min="0"
            :max="20"
            :step="0"
            :minFractionDigits="1"
            :maxFractionDigits="1"
          />
          <InputGroupAddon>%</InputGroupAddon>
        </InputGroup>
      </div>
      
      <div class="input-group">
        <Slider 
          v-model="localPercentage" 
          :min="0" 
          :max="20" 
          :step="0.5"
        />
      </div>
      
      <div class="input-group">
        <label>Monthly contribution</label>
        <InputGroup>
          <InputGroupAddon>$</InputGroupAddon>
          <InputNumber 
            :modelValue="monthlyAmountFromPercentage"
            :disabled="true"
            :useGrouping="true"
          />
        </InputGroup>
        <small class="helper-text">Based on bi-weekly paychecks (employee contribution only)</small>
      </div>
    </div>

    <div v-if="contributionType === 'dollar'">
      <div class="input-group">
        <label>Contribution amount per paycheck</label>
        <InputGroup>
          <InputGroupAddon>$</InputGroupAddon>
          <InputNumber 
            v-model="localDollar"
            :min="0"
            :max="2000"
            :step="0"
            :useGrouping="true"
          />
        </InputGroup>
      </div>
      
      <div class="input-group">
        <Slider 
          v-model="localDollar" 
          :min="0" 
          :max="5000" 
          :step="50"
        />
      </div>
      
      <div class="input-group">
        <label>Monthly contribution</label>
        <InputGroup>
          <InputGroupAddon>$</InputGroupAddon>
          <InputNumber 
            :modelValue="monthlyAmountFromDollar"
            :disabled="true"
            :useGrouping="true"
          />
        </InputGroup>
        <small class="helper-text">Based on bi-weekly paychecks (employee contribution only)</small>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputNumber from 'primevue/inputnumber'
import Slider from 'primevue/slider'

export default {
  name: 'ContributionSlider',

  components: {
    InputGroup,
    InputGroupAddon,
    InputNumber,
    Slider
  },

  props: {
    contributionType: {
      type: String,
      required: true
    },
    percentageRate: {
      type: Number,
      required: true
    },
    dollarAmount: {
      type: Number,
      required: true
    },
    annualSalary: {
      type: Number,
      required: true
    },
    paychecksPerYear: {
      type: Number,
      required: true
    }
  },

  emits: ['update:percentageRate', 'update:dollarAmount'],

  computed: {
    monthlyAmountFromPercentage() {
      const perPaycheck = (this.annualSalary / this.paychecksPerYear) * (this.percentageRate / 100)
      return Math.round(perPaycheck * (this.paychecksPerYear / 12))
    },

    monthlyAmountFromDollar() {
      return Math.round(this.dollarAmount * (this.paychecksPerYear / 12))
    },

    localPercentage: {
      get() {
        return this.percentageRate
      },
      set(value) {
        this.$emit('update:percentageRate', value)
      }
    },

    localDollar: {
      get() {
        return this.dollarAmount
      },
      set(value) {
        this.$emit('update:dollarAmount', value)
      }
    }
  }
}
</script>

<style scoped>
.helper-text {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 4px;
}
</style>