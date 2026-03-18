# 📡 Finance Watcher API — Full Reference

**Base URL:** `http://localhost:3001/api/v1`

> All requests require authentication → add header: `Authorization: Bearer <token>`
> 
> In curl: use Postman variable `{{token}}` (saved automatically after Login)

---

## ⚙️ Postman Setup

Create Environment `Finance Watcher Local`:

| Variable | Value |
|---|---|
| `baseUrl` | `http://localhost:3001/api/v1` |
| `token` | *(leave empty, script auto-fills)* |

**Tests** tab for the Login request:
```js
pm.environment.set("token", pm.response.json().accessToken);
```

---

## 🔐 Auth

### Register
```bash
curl -X POST {{baseUrl}}/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","displayName":"John Doe"}'
```

### Login
```bash
curl -X POST {{baseUrl}}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
# Response: { "accessToken": "...", "refreshToken": "..." }
```

### Refresh Token
```bash
curl -X POST {{baseUrl}}/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"userId":"<user-id>","refreshToken":"<refresh-token>"}'
```

### Logout
```bash
curl -X POST {{baseUrl}}/auth/logout \
  -H "Authorization: Bearer {{token}}"
```

### Get Current User
```bash
curl {{baseUrl}}/auth/me \
  -H "Authorization: Bearer {{token}}"
```

---

## 💳 Wallets

### GET All
```bash
curl {{baseUrl}}/wallets -H "Authorization: Bearer {{token}}"
```

### GET One
```bash
curl {{baseUrl}}/wallets/<id> -H "Authorization: Bearer {{token}}"
```

### POST Create
```bash
curl -X POST {{baseUrl}}/wallets \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chase Bank",
    "type": "BANK",
    "balance": 5000,
    "currency": "USD",
    "color": "#3b82f6",
    "icon": "🏦"
  }'
```
> **type:** `CASH` | `BANK` | `E_WALLET` | `CREDIT`

### PATCH Update
```bash
curl -X PATCH {{baseUrl}}/wallets/<id> \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Chase Bank (updated)","balance":7000}'
```

### DELETE
```bash
curl -X DELETE {{baseUrl}}/wallets/<id> \
  -H "Authorization: Bearer {{token}}"
```

---

## 💰 Transactions

### GET All (filter + pagination)
```bash
# All
curl "{{baseUrl}}/transactions" -H "Authorization: Bearer {{token}}"

# Filter by type, month, category
curl "{{baseUrl}}/transactions?type=EXPENSE&startDate=2026-03-01&endDate=2026-03-31&category=Food&page=1&limit=20" \
  -H "Authorization: Bearer {{token}}"
```

### GET Monthly Summary
```bash
curl "{{baseUrl}}/transactions/summary?year=2026&month=3" \
  -H "Authorization: Bearer {{token}}"
# Response: { income, expense, saving, investment, net }
```

### GET One
```bash
curl {{baseUrl}}/transactions/<id> -H "Authorization: Bearer {{token}}"
```

### POST — Income
```bash
curl -X POST {{baseUrl}}/transactions \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INCOME",
    "amount": 5000,
    "originalAmount": 5000,
    "originalCurrency": "USD",
    "category": "Salary",
    "subCategory": "Base Salary",
    "date": "2026-03-18",
    "notes": "March Salary"
  }'
```

### POST — Expense
```bash
curl -X POST {{baseUrl}}/transactions \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "EXPENSE",
    "amount": 50,
    "originalAmount": 50,
    "originalCurrency": "USD",
    "category": "Food",
    "subCategory": "Restaurant",
    "date": "2026-03-18"
  }'
```

### POST — Saving
```bash
curl -X POST {{baseUrl}}/transactions \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SAVING",
    "amount": 1000,
    "originalAmount": 1000,
    "originalCurrency": "USD",
    "category": "Savings",
    "subCategory": "Monthly Savings",
    "date": "2026-03-18"
  }'
```

### POST — Investment
```bash
curl -X POST {{baseUrl}}/transactions \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INVESTMENT",
    "amount": 2000,
    "originalAmount": 2000,
    "originalCurrency": "USD",
    "category": "Securities",
    "subCategory": "Stocks",
    "date": "2026-03-18"
  }'
```

### PATCH Update
```bash
curl -X PATCH {{baseUrl}}/transactions/<id> \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"amount":200,"notes":"Updated notes"}'
```

### DELETE
```bash
curl -X DELETE {{baseUrl}}/transactions/<id> \
  -H "Authorization: Bearer {{token}}"
```

---

## 📈 Portfolio

### GET All
```bash
curl {{baseUrl}}/portfolio -H "Authorization: Bearer {{token}}"
```

### GET PnL Summary
```bash
curl {{baseUrl}}/portfolio/summary -H "Authorization: Bearer {{token}}"
# Response: { totalCost, totalValue, pnl, pnlPct, count }
```

### GET One
```bash
curl {{baseUrl}}/portfolio/<id> -H "Authorization: Bearer {{token}}"
```

### POST — Stock
```bash
curl -X POST {{baseUrl}}/portfolio \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Apple",
    "ticker": "AAPL",
    "assetType": "STOCK",
    "units": 10,
    "costBasis": 150,
    "currentPrice": 170,
    "currency": "USD",
    "purchaseDate": "2026-01-15"
  }'
```

### POST — Crypto
```bash
curl -X POST {{baseUrl}}/portfolio \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bitcoin",
    "ticker": "BTC",
    "assetType": "CRYPTO",
    "units": 0.5,
    "costBasis": 40000,
    "currentPrice": 65000,
    "currency": "USD"
  }'
```
> **assetType:** `STOCK` | `CRYPTO` | `REAL_ESTATE` | `GOLD` | `OTHER`

### PATCH — Update current price
```bash
curl -X PATCH {{baseUrl}}/portfolio/<id> \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"currentPrice": 180}'
```

### DELETE
```bash
curl -X DELETE {{baseUrl}}/portfolio/<id> \
  -H "Authorization: Bearer {{token}}"
```

---

## 🎯 Savings Goals

### GET All
```bash
curl {{baseUrl}}/goals -H "Authorization: Bearer {{token}}"
```

### GET One
```bash
curl {{baseUrl}}/goals/<id> -H "Authorization: Bearer {{token}}"
```

### POST Create
```bash
curl -X POST {{baseUrl}}/goals \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buy a car",
    "targetAmount": 30000,
    "currentAmount": 5000,
    "deadline": "2026-12-31",
    "color": "#6366f1",
    "icon": "🚗"
  }'
```

### POST — Contribute to goal
```bash
curl -X POST {{baseUrl}}/goals/<id>/contribute \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}'
# Automatically becomes COMPLETED when currentAmount >= targetAmount
```

### PATCH Update
```bash
curl -X PATCH {{baseUrl}}/goals/<id> \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Buy a truck","targetAmount":40000,"deadline":"2027-06-30"}'
```

### DELETE
```bash
curl -X DELETE {{baseUrl}}/goals/<id> \
  -H "Authorization: Bearer {{token}}"
```

---

## 🔄 Recurring Items

### GET All
```bash
curl {{baseUrl}}/recurring -H "Authorization: Bearer {{token}}"
```

### GET One
```bash
curl {{baseUrl}}/recurring/<id> -H "Authorization: Bearer {{token}}"
```

### POST Create
```bash
curl -X POST {{baseUrl}}/recurring \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "EXPENSE",
    "amount": 15,
    "originalCurrency": "USD",
    "category": "Subscriptions",
    "subCategory": "Netflix",
    "interval": "MONTHLY",
    "nextDate": "2026-04-01",
    "notes": "Netflix Premium"
  }'
```
> **interval:** `DAILY` | `WEEKLY` | `MONTHLY` | `YEARLY`  
> **type:** `INCOME` | `EXPENSE` | `SAVING` | `INVESTMENT`

### PATCH — Toggle active
```bash
curl -X PATCH {{baseUrl}}/recurring/<id> \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"active": false}'
```

### PATCH — Update next date
```bash
curl -X PATCH {{baseUrl}}/recurring/<id> \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"nextDate": "2026-05-01"}'
```

### DELETE
```bash
curl -X DELETE {{baseUrl}}/recurring/<id> \
  -H "Authorization: Bearer {{token}}"
```

---

## 📊 Analytics

### GET Dashboard Overview
```bash
curl {{baseUrl}}/analytics/dashboard -H "Authorization: Bearer {{token}}"
```
Response:
```json
{
  "thisMonth": { "income": 5000, "expense": 1500, "saving": 1000, "net": 3500,
                 "incomeChange": 5.2, "expenseChange": -10.0 },
  "totalAssets": 150000,
  "portfolioValue": 50000,
  "savingPercent": 40.5
}
```

### GET Net Worth History
```bash
curl "{{baseUrl}}/analytics/net-worth?year=2026" -H "Authorization: Bearer {{token}}"
```
Response:
```json
{
  "year": 2026,
  "data": [
    { "month": "Jan", "netWorth": 130000 },
    { "month": "Feb", "netWorth": 140000 },
    { "month": "Mar", "netWorth": 150000 }
  ]
}
```

### GET Spending by Category (Pie chart)
```bash
curl "{{baseUrl}}/analytics/spending?year=2026&month=3" -H "Authorization: Bearer {{token}}"
```
Response:
```json
[
  { "name": "Food", "value": 500, "color": "#f59e0b" },
  { "name": "Transport", "value": 300, "color": "#fb923c" },
  { "name": "Entertainment", "value": 200, "color": "#7c3aed" }
]
```
