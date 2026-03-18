# Implementation Plan: Reports & Excel Export

## Goal Description
Create a reporting area where users can filter inventory by specific criteria (e.g., zero stock, low stock, specific colors needed for restocking) and export the filtered results to an Excel (`.xlsx`) file.

## Proposed Changes

### Dependencies
- Install the `xlsx` package to handle Excel file generation.

### Frontend Components

#### [MODIFY] src/services/caseService.ts
- Add a new method `getReport(filters: ReportFilters)` to fetch data from Supabase based on complex filters like stock status (zero, low, all) and brand/model queries.

#### [NEW] src/pages/ReportsPage.tsx
- Create a new page dedicated to Reports.
- Add filter controls:
  - Search (Brand/Model/Barcode)
  - Stock Status (All, Zero Stock, Low Stock, In Stock)
  - Color (Select specific color to see what needs restocking)
- Add a data table to preview the filtered results.
- Add an "Export to Excel" button that uses the `xlsx` library to download the current filtered list.

#### [MODIFY] src/App.tsx
- Add a new route `/relatorios` for the `ReportsPage`.

#### [MODIFY] src/components/Layout.tsx
- Add the Reports page (`/relatorios`) to the bottom navigation bar using the `FiFileText` icon.

## Verification Plan

### Automated Tests
- Run `npm run build` to verify TypeScript compilation and build process succeed without errors.

### Manual Verification
1. Open the application in the browser (`npm run dev`).
2. Navigate to the new "Relatórios" (Reports) tab.
3. Apply different filters (Zero stock, Low stock, search queries).
4. Verify the data table updates correctly to reflect the filters.
5. Click the "Exportar Excel" button.
6. Open the downloaded `.xlsx` file in Excel or Google Sheets and verify the columns (Brand, Model, Type, Color, Quantity, Location) and data match the filtered results.
