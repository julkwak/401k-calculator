<!-- Retirement balance chart component with stacked area visualization -->
<template>
  <div>
    <div class="retirement-header">
      <span class="label">Projected 401(k) balance at retirement</span>
      <div class="balance-amount">
        <span class="currency">$</span>{{ formattedRetirementBalance }}
      </div>
    </div>

    <div class="chart-controls">
      <button
        class="toggle-btn"
        @click="toggleMonteCarlo"
      >
        {{ showMonteCarlo ? 'Show Breakdown' : 'Show Monte Carlo Simulation' }}
      </button>
    </div>

    <div class="chart-container">
      <apexchart
        :type="showMonteCarlo ? 'line' : 'area'"
        :height="CHART_HEIGHT"
        :options="chartOptions"
        :series="chartSeries"
      />
      <p class="chart-note" :class="{ invisible: !showMonteCarlo }">
        Note: Y-axis scaled to 90th percentile. Some outlier simulations may extend beyond the visible range.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, type PropType } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'

// Constants
const CHART_HEIGHT = 400
const MAX_X_AXIS_TICKS = 10
const SIMULATION_COUNT = 50
const VOLATILITY = 0.16 // 16% standard deviation (historical S&P 500 average)
const PERCENTILE_HIGH = 90 // Exclude simulations above this percentile from y-axis

const COLORS = {
  primary: '#023149',
  contributions: '#60a5fa',
  employerMatch: '#f59e0b',
  investmentReturns: '#10b981',
  simulationPath: 'rgba(96, 165, 250, 0.5)',
  medianPath: '#023149',
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
  return '$' + Math.floor(value).toLocaleString()
}

// Box-Muller transform for generating normally distributed random numbers
function generateNormalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + z * stdDev
}

interface SimulationResult {
  balances: number[]
}

function runMonteCarloSimulation(
  startBalance: number,
  years: number,
  annualContribution: number,
  expectedReturn: number,
  volatility: number,
  simulationCount: number
): SimulationResult[] {
  const results: SimulationResult[] = []

  for (let sim = 0; sim < simulationCount; sim++) {
    const balances: number[] = [startBalance]
    let balance = startBalance

    for (let year = 0; year < years; year++) {
      const randomReturn = generateNormalRandom(expectedReturn, volatility)
      balance = balance * (1 + randomReturn) + annualContribution
      balances.push(Math.max(0, Math.round(balance)))
    }

    results.push({ balances })
  }

  return results
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
    const showMonteCarlo = ref(false)

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

    const monteCarloSimulations = computed(() => {
      return runMonteCarloSimulation(
        props.currentBalance,
        yearsUntilRetirement.value,
        props.totalAnnualContribution,
        props.averageAnnualReturn,
        VOLATILITY,
        SIMULATION_COUNT
      )
    })

    // Calculate median path for Monte Carlo
    const medianPath = computed(() => {
      const path: number[] = []
      const years = yearsUntilRetirement.value + 1
      for (let i = 0; i < years; i++) {
        const valuesAtYear = monteCarloSimulations.value.map(sim => sim.balances[i])
        valuesAtYear.sort((a, b) => a - b)
        const mid = Math.floor(valuesAtYear.length / 2)
        path.push(valuesAtYear[mid])
      }
      return path
    })

    // Calculate y-axis bounds based on percentiles to exclude outliers
    const yAxisBounds = computed(() => {
      const allFinalValues = monteCarloSimulations.value.map(sim => sim.balances[sim.balances.length - 1])
      allFinalValues.sort((a, b) => a - b)
      const highIndex = Math.floor(allFinalValues.length * PERCENTILE_HIGH / 100)
      return {
        min: 0,
        max: Math.ceil(allFinalValues[highIndex] * 1.1)
      }
    })

    const chartSeries = computed(() => {
      if (showMonteCarlo.value) {
        // Monte Carlo view: simulation lines + median only
        const simulationSeries = monteCarloSimulations.value.map((sim, index) => ({
          name: `Simulation ${index + 1}`,
          type: 'line',
          data: sim.balances
        }))

        return [
          ...simulationSeries,
          { name: 'Median Projection', type: 'line', data: medianPath.value }
        ]
      } else {
        // Default view: stacked area chart
        return [
          { name: 'Contributions', type: 'area', data: chartData.value.contributions },
          { name: 'Employer Match', type: 'area', data: chartData.value.employerMatch },
          { name: 'Investment Returns', type: 'area', data: chartData.value.investmentReturns }
        ]
      }
    })

    const chartOptions = computed<ApexOptions>(() => {
      const { ages } = chartData.value

      if (showMonteCarlo.value) {
        // Monte Carlo view options
        const simColors: string[] = []
        const simStrokeWidths: number[] = []
        const simOpacities: number[] = []
        for (let i = 0; i < SIMULATION_COUNT; i++) {
          simColors.push(COLORS.simulationPath)
          simStrokeWidths.push(1)
          simOpacities.push(0.4)
        }

        return {
          chart: {
            type: 'line',
            stacked: false,
            fontFamily: FONT_FAMILY,
            toolbar: { show: false },
            animations: {
              enabled: true,
              speed: 800,
              easing: 'linear',
              animateGradually: { enabled: false },
              dynamicAnimation: { enabled: true, speed: 300 }
            }
          },
          colors: [...simColors, COLORS.medianPath],
          dataLabels: { enabled: false },
          stroke: {
            curve: 'smooth',
            width: [...simStrokeWidths, 3]
          },
          fill: {
            type: 'solid',
            opacity: [...simOpacities, 1]
          },
          xaxis: {
            categories: ages,
            tickAmount: Math.min(ages.length - 1, MAX_X_AXIS_TICKS),
            tooltip: { enabled: false },
            title: {
              text: 'Age',
              style: { fontSize: '12px', fontWeight: 1000, color: COLORS.primary }
            },
            labels: { style: { fontSize: '11px', colors: COLORS.primary } },
            axisBorder: { color: COLORS.border },
            axisTicks: { color: COLORS.border }
          },
          yaxis: {
            forceNiceScale: true,
            labels: {
              formatter: formatCurrency,
              style: { fontSize: '11px', colors: COLORS.primary }
            }
          },
          grid: { borderColor: COLORS.gridLine, strokeDashArray: 0 },
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '12px',
            fontWeight: 500,
            labels: { colors: COLORS.primary },
            itemMargin: { horizontal: 12 },
            showForSingleSeries: true,
            customLegendItems: ['Simulation Paths', 'Median Projection'],
            markers: {
              size: 5,
              strokeWidth: 0,
              fillColors: [COLORS.simulationPath, COLORS.medianPath]
            }
          },
          tooltip: {
            enabled: true,
            shared: false,
            intersect: true,
            custom: ({ series, seriesIndex, dataPointIndex, w }: TooltipParams) => {
              const age = w.globals.categoryLabels[dataPointIndex]
              const seriesName = w.globals.seriesNames[seriesIndex]
              const value = series[seriesIndex][dataPointIndex]

              const simValues = series.slice(0, SIMULATION_COUNT).map(s => s[dataPointIndex]).filter(v => v != null)
              const minVal = Math.min(...simValues)
              const maxVal = Math.max(...simValues)

              return `
                <div style="padding: 12px; font-family: ${FONT_FAMILY};">
                  <div style="font-weight: 700; color: ${COLORS.primary}; margin-bottom: 8px;">Age: ${age}</div>
                  <div style="font-size: 12px; color: ${COLORS.primary};">
                    <div><strong>${seriesName}:</strong> ${formatCurrency(value)}</div>
                    <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid ${COLORS.border};">
                      <div><strong>Simulation Range:</strong></div>
                      <div>Min: ${formatCurrency(minVal)}</div>
                      <div>Max: ${formatCurrency(maxVal)}</div>
                    </div>
                  </div>
                </div>
              `
            }
          }
        }
      } else {
        // Default stacked area view options
        return {
          chart: {
            type: 'area',
            stacked: true,
            fontFamily: FONT_FAMILY,
            toolbar: { show: false },
            animations: { enabled: true, easing: 'easeinout', speed: 600 }
          },
          colors: CHART_COLORS,
          dataLabels: { enabled: false },
          stroke: { curve: 'straight', width: 2 },
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
              style: { fontSize: '12px', fontWeight: 1000, color: COLORS.primary }
            },
            labels: { style: { fontSize: '11px', colors: COLORS.primary } },
            axisBorder: { color: COLORS.border },
            axisTicks: { color: COLORS.border }
          },
          yaxis: {
            forceNiceScale: true,
            labels: {
              formatter: formatCurrency,
              style: { fontSize: '11px', colors: COLORS.primary }
            }
          },
          grid: { borderColor: COLORS.gridLine, strokeDashArray: 0 },
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '12px',
            fontWeight: 500,
            labels: { colors: COLORS.primary },
            markers: { size: 5, strokeWidth: 0 },
            itemMargin: { horizontal: 12 }
          },
          tooltip: {
            shared: true,
            intersect: false,
            custom: ({ series, dataPointIndex, w }: TooltipParams) => {
              const age = w.globals.categoryLabels[dataPointIndex]
              const colors = w.globals.colors
              const names = w.globals.seriesNames

              const rows = series.map((s: number[], i: number) => {
                const value = s[dataPointIndex]
                return `
                  <div style="display: flex; align-items: center; padding: 4px 0; font-size: 12px;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: ${colors[i]}; margin-right: 8px;"></span>
                    <span style="flex: 1;">${names[i]}:</span>
                    <span style="font-weight: 600;">${formatCurrency(value)}</span>
                  </div>
                `
              }).join('')

              return `
                <div style="padding: 12px; font-family: ${FONT_FAMILY};">
                  <div style="font-weight: 700; color: ${COLORS.primary}; margin-bottom: 8px; border-bottom: 1px solid ${COLORS.border}; padding-bottom: 8px;">Age: ${age}</div>
                  ${rows}
                </div>
              `
            }
          }
        }
      }
    })

    const toggleMonteCarlo = () => {
      showMonteCarlo.value = !showMonteCarlo.value
    }

    return {
      CHART_HEIGHT,
      formattedRetirementBalance,
      chartSeries,
      chartOptions,
      showMonteCarlo,
      toggleMonteCarlo
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

.chart-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.toggle-btn {
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #023149;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.chart-container {
  width: 100%;
  min-height: 480px;
}

.chart-note {
  font-size: 0.75rem;
  color: #94a3b8;
  text-align: center;
  margin-top: 8px;
  font-style: italic;
}

.chart-note.invisible {
  visibility: hidden;
}
</style>
