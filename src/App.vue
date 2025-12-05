<!-- Main application component for 401(k) contribution calculator -->
<template>
  <div>
    <div class="header">
      <img :src="logo" alt="Company Logo" class="company-logo" />
    </div>
    <h1>401(k) Contribution Manager</h1>
    
    <div class="description-section">
      <p>
        Take control of your retirement savings with our interactive 401(k) contribution calculator. 
        Adjust your contribution rate, explore different savings strategies, and see how employer matching 
        can boost your retirement fund. Visualize your projected balance at retirement and make informed 
        decisions about your financial future. Whether you prefer contributing a fixed dollar amount or a 
        percentage of your salary, our tool helps you understand the long-term impact of your choices.
      </p>
    </div>
    
    <div class="main-layout">
      <Card class="left-column">
        <template #title>Investment Details</template>
        <template #content>
          <AgeInput 
            :currentAge="currentAge"
            :retirementAge="retirementAge"
            @update:currentAge="currentAge = $event"
            @update:retirementAge="retirementAge = $event"
          />
          
          <SalaryInput 
            :annualSalary="annualSalary"
            :currentBalance="currentBalance"
            @update:annualSalary="annualSalary = $event"
            @update:currentBalance="currentBalance = $event"
          />
          
          <ContributionTypeSelector v-model="contributionType" />
          
          <ContributionSlider 
            :contributionType="contributionType"
            :percentageRate="percentageRate"
            :dollarAmount="dollarAmount"
            :annualSalary="annualSalary"
            :paychecksPerYear="paychecksPerYear"
            @update:percentageRate="percentageRate = $event"
            @update:dollarAmount="dollarAmount = $event"
          />
          
          <EmployerMatchInput
            :employerMatchRate="employerMatchRate"
            :employerMatchLimit="employerMatchLimit"
            :employerMatchCapPct="employerMatchCapPct"
            @update:employerMatchRate="employerMatchRate = $event"
            @update:employerMatchLimit="employerMatchLimit = $event"
            @update:employerMatchCapPct="employerMatchCapPct = $event"
          />
          
          <ReturnRateInput 
            :averageAnnualReturn="averageAnnualReturn"
            @update:averageAnnualReturn="averageAnnualReturn = $event"
          />

          <Divider />

          <div class="ytd-summary">
            <h3>Summary</h3>
            <div class="summary-item">
              <span class="label">YTD Contributions:</span>
              <span class="value">${{ ytdContributions.toLocaleString() }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Annual Projected:</span>
              <span class="value">${{ projectedAnnualContribution.toLocaleString() }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Annual Projected Employer Match:</span>
              <span class="value">${{ employerMatchAmount.toLocaleString() }}</span>
            </div>
            <div class="summary-item highlight">
              <span class="label">Total Annual Contribution:</span>
              <span class="value">${{ totalAnnualContribution.toLocaleString() }}</span>
            </div>
          </div>
        </template>
      </Card>

      <Card class="right-column">
        <template #content>
          <RetirementChart 
            :currentAge="currentAge"
            :retirementAge="retirementAge"
            :currentBalance="currentBalance"
            :totalAnnualContribution="totalAnnualContribution"
            :projectedAnnualContribution="projectedAnnualContribution"
            :employerMatchAmount="employerMatchAmount"
            :averageAnnualReturn="averageAnnualReturn"
          />
        </template>
      </Card>
    </div>
  </div>
</template>

<script lang="ts">
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import AgeInput from './components/AgeInput.vue'
import SalaryInput from './components/SalaryInput.vue'
import ContributionTypeSelector from './components/ContributionTypeSelector.vue'
import ContributionSlider from './components/ContributionSlider.vue'
import EmployerMatchInput from './components/EmployerMatchInput.vue'
import ReturnRateInput from './components/ReturnRateInput.vue'
import RetirementChart from './components/RetirementChart.vue'
import logo from './assets/logo.png'

export default {
  components: {
    Card,
    Divider,
    AgeInput,
    SalaryInput,
    ContributionTypeSelector,
    ContributionSlider,
    EmployerMatchInput,
    ReturnRateInput,
    RetirementChart
  },

  setup() {
    return {
      logo
    }
  },

  data() {
    return {
      contributionType: 'percentage',
      percentageRate: 5,
      dollarAmount: 500,
      annualSalary: 70000,
      paychecksPerYear: 26,
      ytdContributions: 3500,
      currentAge: 30,
      retirementAge: 65,
      averageAnnualReturn: 0.06,
      currentBalance: 15000,
      employerMatchRate: 0.50,
      employerMatchLimit: 0,
      employerMatchCapPct: 6
    }
  },

  computed: {
    perPaycheckContribution() {
      if (this.contributionType === 'percentage') {
        const perPaycheck = this.annualSalary / this.paychecksPerYear
        return (perPaycheck * this.percentageRate) / 100
      } else {
        return this.dollarAmount
      }
    },

    projectedAnnualContribution() {
      return this.perPaycheckContribution * this.paychecksPerYear
    },

    currentContributionPercentage() {
      return (this.projectedAnnualContribution / this.annualSalary) * 100
    },

    employerMatchAmount() {
      const employeeContrib = this.projectedAnnualContribution
      const eligibleComp = this.employerMatchLimit > 0
        ? Math.min(this.annualSalary, this.employerMatchLimit)
        : this.annualSalary

      const percentCapBase = this.employerMatchCapPct > 0
        ? eligibleComp * (this.employerMatchCapPct / 100)
        : Number.POSITIVE_INFINITY

      const matchableBase = Math.min(employeeContrib, percentCapBase)
      return matchableBase * this.employerMatchRate
    },

    totalAnnualContribution() {
      return this.projectedAnnualContribution + this.employerMatchAmount + this.ytdContributions
    }
  }
}
</script>