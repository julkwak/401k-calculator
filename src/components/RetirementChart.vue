<!-- Retirement balance chart component with stacked area visualization -->
<template>
  <div>
    <div class="retirement-header">
      <h2>401(k) balance at retirement</h2>
      <div class="balance-amount">
        ${{ projectedRetirementBalance.toLocaleString('en-US', { maximumFractionDigits: 0 }) }}
      </div>
    </div>

    <div class="chart-container">
      <ZingChart
        :data="chartConfig"
        :height="400"
        :width="'100%'"
        ref="chart"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ZingChart from 'zingchart-vue'

export default defineComponent({
  name: 'RetirementChart',

  components: {
    ZingChart
  },

  props: {
    currentAge: {
      type: Number,
      required: true
    },
    retirementAge: {
      type: Number,
      required: true
    },
    currentBalance: {
      type: Number,
      required: true
    },
    totalAnnualContribution: {
      type: Number,
      required: true
    },
    projectedAnnualContribution: {
      type: Number,
      required: true
    },
    employerMatchAmount: {
      type: Number,
      required: true
    },
    averageAnnualReturn: {
      type: Number,
      required: true
    }
  },

  computed: {
    projectedRetirementBalance() {
      const yearsUntilRetirement = this.retirementAge - this.currentAge
      let balance = this.currentBalance

      for (let year = 0; year < yearsUntilRetirement; year++) {
        balance = balance * (1 + this.averageAnnualReturn)
        balance += this.totalAnnualContribution
      }

      return balance
    },

    chartConfig(): any {
      const yearsUntilRetirement = Math.max(0, this.retirementAge - this.currentAge)

      const ages: number[] = []
      const contributions: number[] = []
      const employerMatch: number[] = []
      const investmentReturns: number[] = []

      let totalContributions = 0
      let totalEmployerMatch = 0
      let totalBalance = this.currentBalance

      ages.push(this.currentAge)
      contributions.push(totalContributions)
      employerMatch.push(totalEmployerMatch)
      investmentReturns.push(this.currentBalance)

      for (let year = 1; year <= yearsUntilRetirement; year++) {
        totalContributions += this.projectedAnnualContribution
        totalEmployerMatch += this.employerMatchAmount

        totalBalance = totalBalance * (1 + this.averageAnnualReturn)
        totalBalance += this.totalAnnualContribution

        const investmentGrowth = totalBalance - totalContributions - totalEmployerMatch

        ages.push(this.currentAge + year)
        contributions.push(Math.round(totalContributions))
        employerMatch.push(Math.round(totalEmployerMatch))
        investmentReturns.push(Math.round(investmentGrowth))
      }

      const series = [
        {
          values: contributions,
          text: 'Contributions',
          'line-color': '#60a5fa',
          'background-color': '#60a5fa',
          'alpha-area': 0.8,
          'line-width': 2
        },
        {
          values: employerMatch,
          text: 'Employer match',
          'line-color': '#f59e0b',
          'background-color': '#f59e0b',
          'alpha-area': 0.8,
          'line-width': 2
        },
        {
          values: investmentReturns,
          text: 'Investment returns',
          'line-color': '#10b981',
          'background-color': '#10b981',
          'alpha-area': 0.8,
          'line-width': 2
        }
      ]

      const lastPlotIndex = series.length - 1

      return {
        type: 'area',
        'background-color': '#ffffff',
        stacked: true,
        globals: {
          fontFamily: 'Poppins, sans-serif'
        },
        plotarea: {
          margin: '50 50 80 80'
        },
        plot: {
          stacked: true,
          'stack-type': 'normal',
          aspect: 'spline',
          marker: { visible: false },
          tooltip: { visible: false }
        },
        'crosshair-x': {
          shared: true,
          'line-color': '#cbd5e1',
          'scale-label': { visible: false },
          'plot-label': {
            'html-mode': true,
            text: '%t: $%v',
            multiple: false,
            'background-color': '#ffffff',
            'border-color': '#e5e7eb',
            'border-width': 1,
            padding: '10px',
            'font-family': 'Poppins',
            'font-size': 12,
            color: '#111827',
            shadow: false,
            'thousands-separator': ',',
            decimals: 0,
            rules: [
              {
                rule: 'true',
                text: '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:%color;margin-right:6px"></span>%t: $%v'
              },
              {
                rule: `%plot-index==${lastPlotIndex}`,
                text: '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:%color;margin-right:6px"></span>%t: $%v<br><span style="font-weight:600">Total:</span> $%stack-total'
              }
            ]
          }
        },
        'scale-x': {
          values: ages,
          label: {
            text: 'Age',
            'font-size': 12,
            'font-color': '#023149',
            'font-family': 'Poppins'
          },
          item: {
            'font-size': 11,
            'font-color': '#023149',
            'font-family': 'Poppins'
          },
          'line-color': '#e5e7eb',
          tick: { 'line-color': '#e5e7eb' }
        },
        'scale-y': {
          label: {
            text: '',
            'font-size': 12,
            'font-family': 'Poppins'
          },
          format: '$%v ',
          'thousands-separator': ',',
          item: {
            'font-size': 11,
            'font-color': '#023149',
            'font-family': 'Poppins'
          },
          'line-color': '#e5e7eb',
          tick: { 'line-color': '#e5e7eb' },
          guide: {
            'line-style': 'solid',
            'line-color': '#f3f4f6',
            alpha: 1
          }
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          'vertical-align': 'bottom',
          'border-width': 0,
          'background-color': 'none',
          item: {
            'font-size': 11,
            'font-color': '#023149',
            'font-family': 'Poppins'
          },
          marker: { type: 'circle', size: 8 }
        },
        series
      }
    }
  }
})
</script>

<style scoped>
.retirement-header {
  margin-bottom: 16px;
}

.balance-amount {
  font-size: 2.8rem;
  font-weight: 600;
  color: #023149;
}

.chart-container {
  width: 100%;
}
</style>