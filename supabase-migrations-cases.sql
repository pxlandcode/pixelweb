-- Add new columns to the cases table

-- Add show_on_main_page boolean column (defaults to false)
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS show_on_main_page boolean DEFAULT false;

-- Add status column for draft/published (defaults to 'draft')
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'published'));

-- Add display_order column for custom ordering (defaults to created_at order)
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS display_order integer;

-- Create an index on display_order for better query performance
CREATE INDEX IF NOT EXISTS idx_cases_display_order ON cases(display_order);

-- Create an index on show_on_main_page and status for filtering
CREATE INDEX IF NOT EXISTS idx_cases_main_page_status ON cases(show_on_main_page, status);

-- Set initial display_order values based on created_at (oldest = 1, newest = highest)
WITH ordered_cases AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM cases
  WHERE display_order IS NULL
)
UPDATE cases 
SET display_order = ordered_cases.row_num
FROM ordered_cases
WHERE cases.id = ordered_cases.id;

-- Make display_order NOT NULL after setting initial values
ALTER TABLE cases 
ALTER COLUMN display_order SET NOT NULL;

-- Add a comment to the table
COMMENT ON COLUMN cases.show_on_main_page IS 'Whether this case should be displayed on the main page cardstack';
COMMENT ON COLUMN cases.status IS 'Draft or published status of the case';
COMMENT ON COLUMN cases.display_order IS 'Display order on the main page (lower numbers appear first)';
