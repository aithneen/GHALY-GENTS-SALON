PRAGMA foreign_keys = OFF;

CREATE TABLE orders_next (
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
    CHECK (status IN ('new', 'acknowledged', 'completed', 'cancelled')),
  telegram_notified_at TEXT,
  telegram_error TEXT
);

INSERT INTO orders_next
SELECT id, created_at, updated_at, customer_name, phone, package_code,
  selected_services_json, arrival_date, arrival_time, staff_preference, notes,
  CASE WHEN status = 'confirmed' THEN 'acknowledged' ELSE status END,
  telegram_notified_at, telegram_error
FROM orders;

DROP TABLE orders;
ALTER TABLE orders_next RENAME TO orders;

CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_arrival ON orders(arrival_date, arrival_time);

PRAGMA foreign_keys = ON;
