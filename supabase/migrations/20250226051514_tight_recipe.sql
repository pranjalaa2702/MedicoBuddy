/*
  # Prescription Management System Schema

  1. New Tables
    - `prescriptions`
      - `id` (uuid, primary key)
      - `patient_id` (text, required)
      - `medication` (text, required)
      - `dosage` (text, required)
      - `frequency` (text, required)
      - `duration` (text, required)
      - `image_url` (text)
      - `original_text` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `ai_confidence` (float)
      - `ai_warnings` (text[])
      - `ai_suggestions` (text[])

  2. Security
    - Enable RLS on prescriptions table
    - Add policies for authenticated users to manage their prescriptions
*/

CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id text NOT NULL,
  medication text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  duration text NOT NULL,
  image_url text,
  original_text text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  ai_confidence float,
  ai_warnings text[],
  ai_suggestions text[]
);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own prescriptions"
  ON prescriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = patient_id);

CREATE POLICY "Users can insert their own prescriptions"
  ON prescriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = patient_id);

CREATE POLICY "Users can update their own prescriptions"
  ON prescriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = patient_id);