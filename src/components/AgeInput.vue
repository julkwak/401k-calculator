<!-- Age input component for current and retirement age -->
<template>
  <div>
    <div class="input-group">
      <label>Current age</label>
      <InputGroup>
        <InputNumber 
          v-model="localCurrentAge"
          :min="18" 
          :max="100"
          :useGrouping="false"
        />
      </InputGroup>
    </div>
    
    <div class="input-group">
      <label>Retirement age</label>
      <InputGroup>
        <InputNumber 
          v-model="localRetirementAge"
          :min="50" 
          :max="100"
          :useGrouping="false"
        />
      </InputGroup>
    </div>
  </div>
</template>

<script lang="ts">
import InputGroup from 'primevue/inputgroup'
import InputNumber from 'primevue/inputnumber'

export default {
  name: 'AgeInput',

  components: {
    InputGroup,
    InputNumber
  },

  props: {
    currentAge: {
      type: Number,
      required: true
    },
    retirementAge: {
      type: Number,
      required: true
    }
  },

  emits: ['update:currentAge', 'update:retirementAge'],

  computed: {
    localCurrentAge: {
      get() {
        return this.currentAge
      },
      set(value) {
        this.$emit('update:currentAge', value)
      }
    },

    localRetirementAge: {
      get() {
        return this.retirementAge
      },
      set(value) {
        this.$emit('update:retirementAge', value)
      }
    }
  }
}
</script>