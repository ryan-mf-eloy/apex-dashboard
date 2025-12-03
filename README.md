# APEX Transaction Analytics Dashboard

A comprehensive transaction analytics dashboard for payment processing data analysis with support for multiple merchants (APEX and Fenix). The dashboard provides detailed visualizations including transaction volumes, error analysis, approval rates, and temporal patterns.

## Features

- **Multi-Merchant Support:** Switch between APEX and Fenix merchants via dropdown selector
- **KPI Cards:** Track No Capture, With Capture, Zero Auth, and Debit transactions
- **Daily Transaction Volume:** Visual representation of approved vs. declined transactions
- **Error Distribution Heatmap:** Brand vs. Hour analysis showing failed transaction patterns
- **Performance by Card Type:** Detailed metrics for Credit, Debit, and Multiple card types
- **Top Decline Reasons:** Comprehensive error analysis with ABECS-compliant descriptions
- **Transaction History:** Paginated table with full transaction details
- **Interactive Tooltips:** Detailed mitigation strategies for each error code

## Technology Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4
- **Visualization:** Recharts for charts and heatmaps
- **Data Processing:** Python script for CSV parsing and JSON generation
- **Build Tool:** Vite
- **Package Manager:** pnpm

## Project Structure

```
apex-dashboard/
├── client/
│   ├── public/
│   │   ├── data.json          # Generated transaction data
│   │   └── images/            # Static assets
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.tsx       # Main dashboard component
│   │   ├── components/
│   │   │   └── DashboardLayout.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── process_transactions.py    # Data processing script
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Setup Instructions

### Prerequisites

- Node.js 22+
- pnpm 10+
- Python 3.11+

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ryan-mf-eloy/apex-dashboard.git
   cd apex-dashboard
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Process transaction data:**
   ```bash
   python3 process_transactions.py
   ```
   This script reads CSV files from `/home/ubuntu/upload/` and generates `client/public/data.json`.

4. **Start the development server:**
   ```bash
   pnpm run dev
   ```
   The dashboard will be available at `http://localhost:3000`

5. **Build for production:**
   ```bash
   pnpm run build
   ```

## Data Format

### CSV Input Files

The dashboard expects CSV files with the following structure:
- **APEX.csv:** Transaction data for APEX merchant
- **october_transactions-2025-12-03_94908.csv:** Transaction data for Fenix merchant

Key columns:
- `created_at` (format: `YYYY-MM-DD HH:MM:SS.mmm+TZ`)
- `status` (success, failed, pending)
- `category` (authorization, capture, cancellation)
- `transaction_data` (JSON string with error codes, card brand, card type)

### Generated JSON Structure

The `data.json` file contains:
```json
{
  "APEX": {
    "kpis": { /* KPI metrics */ },
    "daily_data": [ /* Daily transaction volumes */ ],
    "brand_data": [ /* Performance by card type */ ],
    "error_data": [ /* Error analysis */ ],
    "heatmap_data": [ /* Brand vs. Hour distribution */ ],
    "heatmap_columns": [ /* Hour labels 0-23 */ ],
    "transactions": [ /* Transaction history */ ]
  },
  "Fenix": { /* Same structure */ }
}
```

## Updating Transaction Data

To update the dashboard with new transaction data:

1. **Replace CSV files** in `/home/ubuntu/upload/`:
   - `APEX.csv`
   - `october_transactions-2025-12-03_94908.csv`

2. **Run the data processing script:**
   ```bash
   python3 process_transactions.py
   ```

3. **Commit and push changes:**
   ```bash
   git add client/public/data.json
   git commit -m "Update transaction data"
   git push origin main
   ```

4. **GitHub Actions** will automatically trigger a build and deployment.

## Automatic Deployment

This project uses **GitHub Actions** for continuous deployment:

- **Trigger:** Any push to the `main` branch
- **Workflow:** `.github/workflows/deploy.yml`
- **Steps:**
  1. Checkout code
  2. Set up Node.js and pnpm
  3. Install dependencies
  4. Build the project
  5. Notify deployment status

The built project is automatically deployed to the Manus platform.

## Error Codes Reference

The dashboard includes ABECS-compliant error descriptions:

| Code | Description | Retry Status |
|------|-------------|--------------|
| ABECS-51 | Insufficient Funds | Allowed |
| ABECS-57 | Card Expired | No Retry |
| ABECS-59 | Suspected Fraud | No Retry |
| ABECS-82 | Invalid Card Data | No Retry |
| ABECS-83 | Invalid Password/PIN | No Retry |
| ABECS-91 | Bank Offline | Allowed |
| GEN-002 | System Error | Check Support |

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test locally with `pnpm run dev`
4. Commit and push to GitHub
5. Changes will be automatically deployed

## License

This project is proprietary and confidential.

## Support

For issues or questions, contact the development team.
