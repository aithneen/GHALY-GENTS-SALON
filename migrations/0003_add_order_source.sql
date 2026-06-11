PRAGMA foreign_keys = OFF;

CREATE TABLE orders_next (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  order_source TEXT NOT NULL DEFAULT 'home'
    CHECK (order_source IN ('home', 'in_salon')),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  package_code TEXT NOT NULL,
  selected_services_json TEXT NOT NULL,
  arrival_date TEXT,
  arrival_time TEXT,
  staff_preference TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'acknowledged', 'completed', 'cancelled')),
  telegram_notified_at TEXT,
  telegram_error TEXT
);

INSERT INTO orders_next
SELECT id, created_at, updated_at, 'home', customer_name, phone, package_code,
  selected_services_json, arrival_date, arrival_time, staff_preference, notes,
  status, telegram_notified_at, telegram_error
FROM orders;

DROP TABLE orders;
ALTER TABLE orders_next RENAME TO orders;

CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_arrival ON orders(arrival_date, arrival_time);
CREATE INDEX idx_orders_source ON orders(order_source);

PRAGMA foreign_keys = ON;
