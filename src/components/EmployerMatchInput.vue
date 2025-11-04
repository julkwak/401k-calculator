<!-- Employer match configuration component -->
<template>
  <div>
    <div class="input-group">
      <label>Employer match rate</label>
      <InputGroup>
        <InputNumber 
          v-model="localMatchRate"
          :min="0"
          :max="200"
          :minFractionDigits="0"
          :maxFractionDigits="0"
        />
        <InputGroupAddon>%</InputGroupAddon>
      </InputGroup>
      <small class="helper-text">Example: 50% match → enter 50</small>
    </div>

    <div class="input-group">
      <label>Percent-of-pay cap (optional)</label>
      <InputGroup>
        <InputNumber
          v-model="localMatchCapPct"
          :min="0"
          :max="100"
          :minFractionDigits="0"
          :maxFractionDigits="2"
        />
        <InputGroupAddon>%</InputGroupAddon>
      </InputGroup>
      <small class="helper-text">0 = no cap (e.g., set 6 for "up to 6% of pay")</small>
    </div>
  </div>
</template>

<script lang="ts">
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputNumber from 'primevue/inputnumber'

export default {
  name: 'EmployerMatchInput',

  components: {
    InputGroup,
    InputGroupAddon,
    InputNumber
  },

  props: {
    employerMatchRate: {
      type: Number,
      required: true
    },
    employerMatchLimit: {
      type: Number,
      required: true
    },
    employerMatchCapPct: {
      type: Number,
      required: true
    }
  },

  emits: ['update:employerMatchRate', 'update:employerMatchLimit', 'update:employerMatchCapPct'],

  computed: {
    localMatchRate: {
      get() {
        return (this.employerMatchRate ?? 0) * 100
      },
      set(value: number) {
        this.$emit('update:employerMatchRate', (value || 0) / 100)
      }
    },

    localMatchCapPct: {
      get() {
        return this.employerMatchCapPct ?? 0
      },
      set(value: number) {
        this.$emit('update:employerMatchCapPct', value || 0)
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