/*
# NutriSA Initial Schema

1. New Tables
- profiles: user profile data with demographics, goals, dietary preferences
  - id (uuid, primary key, references auth.users)
  - email (text, unique)
  - full_name, age, sex, weight_kg, height_cm
  - goal, activity_level, protein_target, calorie_target
  - diet_types (text[]), allergies (text)
  - created_at, updated_at

- meals: logged meal entries
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - name, protein, carbs, fat, calories
  - source ('chat' or 'scan'), image_url
  - created_at

- streaks: daily streak tracking
  - user_id (uuid, primary key)
  - current_streak, best_streak, last_log_date
  - updated_at

- diet_plans: saved generated diet plans
  - id, user_id, plan_data (jsonb), created_at

- grocery_items: grocery list items
  - id, user_id, plan_id, name, category, checked, created_at

2. Security: RLS enabled on all tables with owner-scoped policies.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  age int,
  sex text,
  weight_kg numeric,
  height_cm numeric,
  goal text,
  activity_level text,
  protein_target numeric,
  calorie_target numeric,
  diet_types text[],
  allergies text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  protein numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fat numeric NOT NULL DEFAULT 0,
  calories numeric NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'chat',
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak int NOT NULL DEFAULT 0,
  best_streak int NOT NULL DEFAULT 0,
  last_log_date date,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS diet_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_data jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grocery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES diet_plans(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  checked boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "select_own_meals" ON meals;
CREATE POLICY "select_own_meals" ON meals FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_meals" ON meals;
CREATE POLICY "insert_own_meals" ON meals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_meals" ON meals;
CREATE POLICY "update_own_meals" ON meals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_meals" ON meals;
CREATE POLICY "delete_own_meals" ON meals FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_streaks" ON streaks;
CREATE POLICY "select_own_streaks" ON streaks FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_streaks" ON streaks;
CREATE POLICY "insert_own_streaks" ON streaks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_streaks" ON streaks;
CREATE POLICY "update_own_streaks" ON streaks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_streaks" ON streaks;
CREATE POLICY "delete_own_streaks" ON streaks FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_diet_plans" ON diet_plans;
CREATE POLICY "select_own_diet_plans" ON diet_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_diet_plans" ON diet_plans;
CREATE POLICY "insert_own_diet_plans" ON diet_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_diet_plans" ON diet_plans;
CREATE POLICY "update_own_diet_plans" ON diet_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_diet_plans" ON diet_plans;
CREATE POLICY "delete_own_diet_plans" ON diet_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_grocery_items" ON grocery_items;
CREATE POLICY "select_own_grocery_items" ON grocery_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_grocery_items" ON grocery_items;
CREATE POLICY "insert_own_grocery_items" ON grocery_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_grocery_items" ON grocery_items;
CREATE POLICY "update_own_grocery_items" ON grocery_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_grocery_items" ON grocery_items;
CREATE POLICY "delete_own_grocery_items" ON grocery_items FOR DELETE TO authenticated USING (auth.uid() = user_id);
