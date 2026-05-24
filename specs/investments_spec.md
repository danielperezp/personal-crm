# Module: Investments

## Purpose
Manage investment portfolio: stocks, crypto, mutual funds. Track buy/sell transactions, current holdings, and performance.

## Aggregate: InvestmentAccount (or Portfolio)
- Portfolio per user, containing holdings.
- Simplification: one aggregate “InvestmentTransaction” per buy/sell event; current holdings calculated via projection.

## Commands
- `RecordBuyTransaction` (asset, quantity, price, date)
- `RecordSellTransaction`
- `RecordDividend`/`Interest`

## Events
- `InvestmentBuyRecorded`, `InvestmentSellRecorded`, `InvestmentDividendRecorded`

## Projections
- `investment_transactions` collection
- `holdings` collection (current portfolio, updated by projection handler after each transaction)

## API
- `POST /api/investments/transactions`
- `GET /api/investments/transactions?symbol&dateRange`
- `GET /api/investments/holdings`