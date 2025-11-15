# Onyx CashFlow - Personal Finance Dashboard

A comprehensive personal finance application built with Next.js 15 that enables users to visualize bank balances over time, manage transactions, and forecast future spending through an interactive dashboard interface.

## Features

### Core Functionality

- **Interactive Dashboard**: Real-time visualization of bank balances with area charts showing historical data and forecasts
- **Transaction Management**: Import, view, edit, and categorize transactions
- **CSV Import**: Upload bank statements with intelligent column mapping
- **Forecasting**: Manual predictions and automatic recurring transaction generation
- **Category System**: Create custom categories with color coding
- **Time Period Views**: View data across 1 week, 1 month, 3 months, 6 months, 9 months, or 1 year
- **Dark/Light Theme**: Toggle between dark and light modes (defaults to dark)

### Data Visualization

- **Historical vs Forecast**: Clear visual distinction with solid lines for actual data and dotted lines for predictions
- **Running Balance**: Track cumulative account balance over time
- **Net Change**: Monitor period-over-period variance
- **Interactive Tooltips**: Hover over chart points for detailed information

### Transaction Features

- **Bulk Operations**: Categorize multiple transactions at once
- **Search & Filter**: Find transactions by description or category
- **Individual Editing**: Modify transaction details, amounts, and categories
- **Type Classification**: Automatic classification of debits and credits

### Recurring Transactions

- **Flexible Frequencies**: Weekly, biweekly, monthly, quarterly, and yearly options
- **Duration Control**: Set bounded (specific end date) or unbounded (indefinite) recurrence
- **Auto-generation**: Automatically creates predicted instances within the visible time range

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **UI Components**: HeroUI (formerly NextUI)
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Data Persistence**: LocalStorage
- **Theme Management**: next-themes

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd onyx-cashflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage Guide

### Initial Setup

On first launch, the application loads with mock data demonstrating all features. You can:
1. Explore the dashboard to see balance trends
2. View sample transactions and categories
3. Test all features before importing your own data

### Importing Transactions

1. Navigate to **Import Data** page
2. Click to upload a CSV file from your bank
3. Map CSV columns to required fields:
   - Date (required)
   - Description (required)
   - Amount (required)
   - Type (optional - defaults to sign-based detection)
4. Preview your data
5. Click Import Transactions

**Supported CSV formats**: Any format with headers containing date, description, and amount columns.

### Managing Transactions

1. Go to **Transactions** page
2. Use search to find specific transactions
3. Filter by category
4. Select multiple transactions for bulk categorization
5. Click Edit to modify individual transactions
6. Delete unwanted transactions

### Managing Categories

1. Visit **Categories** page
2. Click **Add Category**
3. Enter a name and select a color
4. Use preset colors or choose a custom color
5. Edit or delete existing categories

### Creating Forecasts

**Manual Predictions**:
1. Go to **Forecasts** page
2. Select **Manual Predictions** tab
3. Click **Add Prediction**
4. Fill in date, description, amount, and category
5. Save the prediction

**Recurring Rules**:
1. Select **Recurring Rules** tab
2. Click **Add Recurring Rule**
3. Configure:
   - Description
   - Amount
   - Frequency (weekly, monthly, etc.)
   - Start date
   - Optional end date
   - Category
4. Save - predictions will auto-generate for future periods

### Using the Dashboard

- **Time Period Selector**: Choose from 1W, 1M, 3M, 6M, 9M, or 1Y views
- **Summary Cards**: View total income, expenses, and net change
- **Balance Chart**: Observe trends with interactive tooltips
- **Transaction List**: Synchronized list showing all transactions in the selected period
- **Today Marker**: Red dashed line indicates current date

### Theme Toggle

Click the sun/moon icon in the navigation bar to switch between light and dark themes. Your preference is automatically saved.

## Data Management

### LocalStorage Schema

All data is stored locally in your browser's LocalStorage:
- Transactions
- Categories
- Recurring Rules
- Manual Predictions
- User Settings

### Clearing Data

To reset the application:
1. Open browser developer tools
2. Navigate to Application → LocalStorage
3. Delete the `onyx-cashflow-data` key
4. Refresh the page to reload mock data

### Exporting Data

Currently, data can be exported by:
1. Opening browser developer tools
2. Console tab
3. Running: `console.log(localStorage.getItem('onyx-cashflow-data'))`
4. Copy the JSON output

## Development

### Project Structure

```
onyx-cashflow/
├── app/                      # Next.js app router pages
│   ├── categories/          # Category management page
│   ├── forecasts/           # Forecast management page
│   ├── import/              # CSV import page
│   ├── transactions/        # Transaction management page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Dashboard page
│   ├── providers.tsx        # Theme and UI providers
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── BalanceChart.tsx    # Recharts area chart
│   ├── Dashboard.tsx       # Main dashboard
│   ├── NavBar.tsx          # Navigation bar
│   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   ├── TimePeriodSelector.tsx  # Time period buttons
│   └── TransactionList.tsx # Transaction list view
├── lib/                     # Utility functions and data
│   ├── mockData.ts         # Sample data for development
│   ├── storage.ts          # LocalStorage operations
│   ├── types.ts            # TypeScript type definitions
│   └── utils.ts            # Helper functions
├── public/                  # Static assets
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Define types in `lib/types.ts`
2. Add storage functions in `lib/storage.ts`
3. Create components in `components/`
4. Add pages in `app/`
5. Update navigation in `components/NavBar.tsx`

## Design Decisions

### Desktop-First Approach

The application is optimized for desktop viewing with:
- Large chart displays
- Side-by-side layouts
- Rich data tables
- Responsive adjustments for smaller screens

### LocalStorage vs Database

LocalStorage was chosen for:
- Zero backend dependencies
- Instant setup
- Privacy (data never leaves the browser)
- Sufficient for personal finance tracking

**Limitations**:
- ~5-10MB storage limit
- No cross-device sync
- No backup/restore (manual export required)

### Component Library Selection

HeroUI was selected for:
- React 19 and Next.js 15 compatibility
- Built on Tailwind CSS
- Accessibility (WAI-ARIA compliant)
- TypeScript support
- Modern design system

## Future Enhancements

Potential features for future versions:
- Budget tracking and alerts
- Income vs expense breakdown charts
- Category-based spending analysis
- Export to CSV/PDF
- Multi-account support
- Cloud backup integration
- Mobile responsive optimizations
- Receipt attachment system
- Bill reminders
- Financial goals tracking

## Browser Compatibility

Tested and supported on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires JavaScript and LocalStorage enabled.

## Troubleshooting

### Mock data not loading
- Clear browser cache
- Delete LocalStorage data
- Refresh the page

### Chart not displaying
- Check browser console for errors
- Ensure JavaScript is enabled
- Try a different browser

### Import failing
- Verify CSV format
- Check for proper headers
- Ensure date format is recognized
- Try mapping columns manually

## License

This project is provided as-is for personal use.

## Contributing

For bug reports or feature requests, please open an issue in the repository.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components by [HeroUI](https://www.heroui.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
