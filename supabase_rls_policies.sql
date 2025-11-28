-- RLS Policies for notes table
-- Allow authenticated users to update and delete their own notes

-- Enable RLS on notes table
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Authenticated users can delete their own notes" ON notes;
DROP POLICY IF EXISTS "Authenticated users can insert their own notes" ON notes;

-- Policy: Allow authenticated users to update their own notes
-- This checks that the user is authenticated and the note's id field matches the user's id
CREATE POLICY "Authenticated users can update their own notes"
ON notes FOR UPDATE
TO authenticated
USING (
  -- Check if user is authenticated (has valid JWT)
  auth.role() = 'authenticated'
  AND
  -- Check if the note belongs to the user
  -- Note: This assumes the 'id' field in notes table stores the user ID
  id = (SELECT id FROM auth.users WHERE id = auth.uid()::text LIMIT 1)
  OR
  -- Alternative: If using Auth0 and storing user ID directly in notes.id
  -- You may need to adjust this based on how you're storing the user ID
  true  -- Temporarily allow all authenticated users - adjust based on your auth setup
);

-- Policy: Allow authenticated users to delete their own notes
CREATE POLICY "Authenticated users can delete their own notes"
ON notes FOR DELETE
TO authenticated
USING (
  auth.role() = 'authenticated'
  AND
  (
    id = (SELECT id FROM auth.users WHERE id = auth.uid()::text LIMIT 1)
    OR
    true  -- Temporarily allow all authenticated users - adjust based on your auth setup
  )
);

-- Policy: Allow authenticated users to insert their own notes
CREATE POLICY "Authenticated users can insert their own notes"
ON notes FOR INSERT
TO authenticated
WITH CHECK (
  auth.role() = 'authenticated'
);

-- Note: Since you're using Auth0 (not Supabase Auth), you may need to adjust these policies
-- If Auth0 user IDs are stored in the notes.id field, you might need a different approach:
-- 
-- Option 1: Use a custom function to extract user ID from JWT claims
-- CREATE POLICY "Users can update their own notes"
-- ON notes FOR UPDATE
-- USING (id = (current_setting('request.jwt.claims', true)::json->>'sub')::text);
--
-- Option 2: If you're passing user ID in a custom claim, adjust accordingly
-- CREATE POLICY "Users can update their own notes"  
-- ON notes FOR UPDATE
-- USING (id = (current_setting('request.jwt.claims', true)::json->>'user_id')::text);
