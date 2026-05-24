# Module: Assets

## Purpose
Track fixed assets (equipment, property, vehicles) and their depreciation, maintenance, and current value.

## Aggregate: Asset
- Attributes: name, category, purchaseDate, purchasePrice, currentValue, depreciationMethod (straight‑line, none), usefulLifeYears, notes, status (active, sold, disposed)

## Commands
- `AddAsset`
- `UpdateAsset`
- `RecordDepreciation`
- `SellAsset`/`DisposeAsset`

## Events
- `AssetAdded`, `AssetUpdated`, `DepreciationRecorded`, `AssetDisposed`

## Projections
- `assets` collection

## API
- `POST /api/assets`
- `GET /api/assets`
- `PUT /api/assets/:id`
- `POST /api/assets/:id/depreciate`
- `POST /api/assets/:id/dispose`