ALTER TABLE products 
ADD COLUMN weight_oz INTEGER DEFAULT 4 CHECK (weight_oz IS NULL OR weight_oz > 0)