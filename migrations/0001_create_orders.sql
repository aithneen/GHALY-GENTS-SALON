CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  package_code TEXT NOT NULL,
  selected_services_json TEXT NOT NULL,
  arrival_date TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  staff_preference TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'confirmed', 'completed', 'cancelled')),
  telegram_notified_at TEXT,
  telegram_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_arrival
  ON orders(arrival_date, arrival_time);
