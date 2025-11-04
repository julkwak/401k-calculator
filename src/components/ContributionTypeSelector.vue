<!-- Contribution type selector component for choosing between dollar or percentage mode -->
<template>
  <div>
    <div class="input-group">
      <label>Contribution type</label>
      <div class="type-selector">
        <button 
          @click="selectedType = 'dollar'"
          :class="['type-button', { active: selectedType === 'dollar' }]"
        >
          $ Dollar
        </button>
        <button 
          @click="selectedType = 'percentage'"
          :class="['type-button', { active: selectedType === 'percentage' }]"
        >
          % Percentage
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ContributionTypeSelector',

  props: {
    modelValue: {
      type: String,
      required: true
    }
  },

  emits: ['update:modelValue'],

  computed: {
    selectedType: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>

<style scoped>
.type-selector {
  display: flex;
  gap: 8px;
}

.type-button {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #023149;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.type-button:hover {
  border-color: #0fa5a3;
}

.type-button.active {
  border-color: #0fa5a3;
  background: #eff6ff;
  color: #0fa5a3;
  font-weight: 600;
}
</style>