<!-- Retirement balance chart component with stacked area visualization -->
<template>
  <div>
    <div class="retirement-header">
      <span class="label">Projected 401(k) balance at retirement</span>
      <div class="balance-amount">
        <span class="currency">$</span>{{ formattedRetirementBalance }}
      </div>
    </div>

    <div class="chart-container">
      <apexchart
        type="area"
        :height="CHART_HEIGHT"
        :options="chartOptions"
        :series="chartSeries"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'

// Constants
const CHART_HEIGHT = 400
const MAX_X_AXIS_TICKS = 10

const COLORS = {
  primary: '#023149',
  contributions: '#60a5fa',
  employerMatch: '#f59e0b',
  investmentReturns: '#10b981',
  border: '#e5e7eb',
  gridLine: '#d1d5db'
} as const

const FONT_FAMILY = 'Poppins, sans-serif'

// Types
interface ChartData {
  ages: number[]
  contributions: number[]
  employerMatch: number[]
  investmentReturns: number[]
}

interface TooltipParams {
  series: number[][]
  seriesIndex: number
  dataPointIndex: number
  w: {
    globals: {
      categoryLabels: string[]
      colors: string[]
      seriesNames: string[]
    }
  }
}

// Helper functions
function formatCurrency(value: number): string {
  return '$' + value.toLocaleString()
}

function buildTooltipHtml({ series, dataPointIndex, w }: TooltipParams): string {
  const age = w.globals.categoryLabels[dataPointIndex]
  const colors = w.globals.colors
  const names = w.globals.seriesNames

  const headerHtml = `
    <div style="
      text-align: center;
      font-size: 15px;
      font-weight: 700;
      padding-bottom: 8px;
      border-bottom: 1px solid ${COLORS.border};
      color: ${COLORS.primary};
    ">
      Age: ${age}
    </div>
  `

  const rowsHtml = series.map((s, i) => {
    const value = s[dataPointIndex]
    const isLast = i === series.length - 1
    const borderStyle = !isLast ? `border-bottom: 1px solid ${COLORS.border};` : ''

    return `
      <div style="
        display: flex;
        align-items: center;
        padding: 6px 0;
        ${borderStyle}
        font-size: 12px;
        font-weight: 500;
        color: ${COLORS.primary};
      ">
        <span style="
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${colors[i]};
          margin-right: 8px;
        "></span>
        <span style="flex: 1; margin-right: 16px;">${names[i]}:</span>
        <span style="font-weight: 600;">${formatCurrency(value)}</span>
      </div>
    `
  }).join('')

  return `
    <div style="padding: 12px; font-family: ${FONT_FAMILY};">
      ${headerHtml}
      ${rowsHtml}
    </div>
  `
}

export default defineComponent({
  name: 'RetirementChart',

  components: {
    apexchart: VueApexCharts
  },

  props: {
    currentAge: {
      type: Number as PropType<number>,
      required: true
    },
    retirementAge: {
      type: Number as PropType<number>,
      required: true
    },
    currentBalance: {
      type: Number as PropType<number>,
      required: true
    },
    totalAnnualContribution: {
      type: Number as PropType<number>,
      required: true
    },
    projectedAnnualContribution: {
      type: Number as PropType<number>,
      required: true
    },
    employerMatchAmount: {
      type: Number as PropType<number>,
      required: true
    },
    averageAnnualReturn: {
      type: Number as PropType<number>,
      required: true
    }
  },

  setup(props) {
    const CHART_COLORS = [
      COLORS.contributions,
      COLORS.employerMatch,
      COLORS.investmentReturns
    ]

    const yearsUntilRetirement = computed(() =>
      Math.max(0, props.retirementAge - props.currentAge)
    )

    const projectedRetirementBalance = computed(() => {
      let balance = props.currentBalance
      for (let year = 0; year < yearsUntilRetirement.value; year++) {
        balance = balance * (1 + props.averageAnnualReturn)
        balance += props.totalAnnualContribution
      }
      return balance
    })

    const formattedRetirementBalance = computed(() =>
      projectedRetirementBalance.value.toLocaleString('en-US', { maximumFractionDigits: 0 })
    )

    const chartData = computed<ChartData>(() => {
      const ages: number[] = [props.currentAge]
      const contributions: number[] = [0]
      const employerMatch: number[] = [0]
      const investmentReturns: number[] = [props.currentBalance]

      let totalContributions = 0
      let totalEmployerMatch = 0
      let totalBalance = props.currentBalance

      for (let year = 1; year <= yearsUntilRetirement.value; year++) {
        totalContributions += props.projectedAnnualContribution
        totalEmployerMatch += props.employerMatchAmount
        totalBalance = totalBalance * (1 + props.averageAnnualReturn) + props.totalAnnualContribution

        const investmentGrowth = totalBalance - totalContributions - totalEmployerMatch

        ages.push(props.currentAge + year)
        contributions.push(Math.round(totalContributions))
        employerMatch.push(Math.round(totalEmployerMatch))
        investmentReturns.push(Math.round(investmentGrowth))
      }

      return { ages, contributions, employerMatch, investmentReturns }
    })

    const chartSeries = computed(() => [
      { name: 'Contributions', data: chartData.value.contributions },
      { name: 'Employer Match', data: chartData.value.employerMatch },
      { name: 'Investment Returns', data: chartData.value.investmentReturns }
    ])

    const chartOptions = computed<ApexOptions>(() => {
      const { ages } = chartData.value

      return {
        chart: {
          type: 'area',
          stacked: true,
          fontFamily: FONT_FAMILY,
          toolbar: { show: false },
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 600
          }
        },
        colors: CHART_COLORS,
        dataLabels: { enabled: false },
        stroke: {
          curve: 'straight',
          width: 2
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 0.5,
            opacityFrom: 0.9,
            opacityTo: 0.6,
            stops: [0, 100]
          }
        },
        xaxis: {
          categories: ages,
          tickAmount: Math.min(ages.length - 1, MAX_X_AXIS_TICKS),
          tooltip: { enabled: false },
          title: {
            text: 'Age',
            style: {
              fontSize: '12px',
              fontWeight: 1000,
              color: COLORS.primary
            }
          },
          labels: {
            style: {
              fontSize: '11px',
              colors: COLORS.primary
            }
          },
          axisBorder: { color: COLORS.border },
          axisTicks: { color: COLORS.border }
        },
        yaxis: {
          labels: {
            formatter: formatCurrency,
            style: {
              fontSize: '11px',
              colors: COLORS.primary
            }
          }
        },
        grid: {
          borderColor: COLORS.gridLine,
          strokeDashArray: 0
        },
        legend: {
          position: 'bottom',
          horizontalAlign: 'center',
          fontSize: '12px',
          fontWeight: 500,
          labels: { colors: COLORS.primary },
          markers: {
            width: 10,
            height: 10,
            radius: 10
          },
          itemMargin: { horizontal: 12 }
        },
        tooltip: {
          shared: true,
          intersect: false,
          custom: buildTooltipHtml
        }
      }
    })

    return {
      CHART_HEIGHT,
      formattedRetirementBalance,
      chartSeries,
      chartOptions
    }
  }
})
</script>

<style scoped>
.retirement-header {
  margin-bottom: 24px;
  text-align: center;
}

.retirement-header .label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 50px;
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 3rem;
  font-weight: 700;
  color: #023149;
  letter-spacing: -1px;
  padding-bottom: 12px;
}

.balance-amount .currency {
  font-size: 1.8rem;
  font-weight: 600;
  vertical-align: top;
  margin-right: 2px;
  color: #0fa5a3;
}

.chart-container {
  width: 100%;
}
</style>
