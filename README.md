# 401(k) Contribution Take Home

This is the single-page web application as part of Human Interest's take-home examination. I tried to build an interface that resembles Human Interest's actual website and provides intuitive and expressive interface and visualizations.


## Features

### Core Functionality
- **Contribution Type Selection**: Choose between percentage-based or fixed dollar amount contributions
- **Interactive Controls**: Adjust contribution rates using sliders and number inputs for precise control
- **Employer Match Calculator**: Configure employer matching with customizable match rates and caps
- **Real-time Projections**: See immediate updates to your retirement balance projections as you adjust settings
- **Year-to-Date Tracking**: View current year contributions and projected annual totals

### Visualizations
- **Interactive Chart**: Stacked area chart showing the breakdown of:
  - Employee contributions
  - Employer match contributions 
  - Investment returns over time
- **Retirement Balance Projection**: Display of projected balance at retirement age
- **Summary Dashboard**: Clear overview of all contribution metrics

## Technology Stack

- **Framework**: Vue 3 with TypeScript
- **UI Library**: PrimeVue (Aura theme preset)
- **Charts**: ZingChart
- **Styling**: Custom CSS with Poppins font family

## Prerequisites

- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher (comes with Node.js)

To check your versions:
```bash
node --version
npm --version
```

If you need to install or update Node.js, download it from [nodejs.org](https://nodejs.org/)

## Dependencies

### Core Dependencies
- **vue** (^3.4.0): Vue 3 framework
- **primevue** (^4.0.0): UI component library
- **primeicons** (^7.0.0): Icon library for PrimeVue
- **@primevue/themes** (^4.0.0): Theme system for PrimeVue
- **zingchart** (^2.9.13): Charting library
- **zingchart-vue** (^1.1.1): Vue wrapper for ZingChart

### Dev Dependencies
- **@vitejs/plugin-vue** (^5.0.0): Vite plugin for Vue
- **typescript** (^5.3.0): TypeScript language support
- **vite** (^5.0.0): Build tool and dev server
- **vue-tsc** (^1.8.0): TypeScript type checking for Vue

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 401k-contribution-manager
```

2. Install dependencies:
```bash
npm install
```

This command reads the `package.json` file and automatically installs all required libraries and dependencies for the project. You only need to run this once (or whenever dependencies are updated).

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

To stop the server, press `Ctrl+C` in the terminal.

## Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── App.vue                          # Main application component
├── main.ts                          # Application entry point
├── assets/
│   └── styles.css                   # Global styles
└── components/
    ├── AgeInput.vue                 # Current and retirement age inputs
    ├── SalaryInput.vue              # Annual income and current balance inputs
    ├── ContributionTypeSelector.vue # Toggle between percentage/dollar modes
    ├── ContributionSlider.vue       # Main contribution adjustment interface
    ├── EmployerMatchInput.vue       # Employer match configuration
    ├── ReturnRateInput.vue          # Investment return rate input
    └── RetirementChart.vue          # Retirement projection visualization
```

## How to Use

1. **Set Your Profile**
   - Enter your current age and desired retirement age
   - Input your annual income and current 401(k) balance

2. **Choose Contribution Method**
   - Select either "$ Dollar" for fixed amount per paycheck
   - Or "% Percentage" for percentage of salary

3. **Adjust Your Contribution**
   - Use the slider or number input to set your desired contribution amount
   - View the monthly contribution estimate (based on bi-weekly paychecks)

4. **Configure Employer Match**
   - Set your employer's match rate (e.g., 50% means they match $0.50 per $1.00)
   - Optionally set a percent-of-pay cap if applicable

5. **Set Investment Return Rate**
   - Adjust the estimated annual return rate (default 6%)

6. **View Your Projections**
   - Check the Summary section for annual contribution totals
   - Review the projected retirement balance at the top of the chart
   - Explore the interactive chart to see how contributions grow over time

## Mock Data

The application uses the following mock data for demonstration:
- Annual salary: $100,000
- Current 401(k) balance: $100,000
- Year-to-date contributions: $3,500
- Paychecks per year: 26 (bi-weekly)
- Default contribution rate: 5%
- Default employer match: 50% up to 6% of salary
- Average annual return: 6%

## Key Calculations

- **Monthly Contribution**: Calculated based on bi-weekly paychecks (26 per year)
- **Employer Match**: Applied based on match rate and optional percent-of-pay cap
- **Retirement Balance**: Compounds annually using the specified return rate
- **Investment Returns**: Separated from contributions to show growth attribution

## Customization

To modify default values, edit the `data()` section in `src/App.vue`:

```typescript
data() {
  return {
    contributionType: 'percentage',
    percentageRate: 5,
    dollarAmount: 500,
    annualSalary: 100000,
    // ... other values
  }
}
```

## Note
Claude AI was used in the creation of this project.