-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  customer_name TEXT,
  date DATE DEFAULT CURRENT_DATE,
  source TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  sentiment_score FLOAT,
  summary TEXT,
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  is_urgent BOOLEAN DEFAULT FALSE,
  is_feature_request BOOLEAN DEFAULT FALSE,
  feature_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Keywords Table
CREATE TABLE IF NOT EXISTS keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  keyword TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. KPI Cache Table
CREATE TABLE IF NOT EXISTS kpi_cache (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE PRIMARY KEY,
  data JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Feature Requests Table
CREATE TABLE IF NOT EXISTS feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  votes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Under Review',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact TEXT,
  priority TEXT,
  category TEXT,
  affected_area TEXT,
  estimated_effort TEXT,
  affected_users INTEGER,
  detected_pattern TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects
CREATE POLICY "Users can manage their own projects" ON projects FOR ALL USING (auth.uid() = user_id);

-- Reviews
CREATE POLICY "Users can manage reviews in their projects" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = reviews.project_id AND projects.user_id = auth.uid())
);

-- Keywords
CREATE POLICY "Users can manage keywords in their projects" ON keywords FOR ALL USING (
  EXISTS (
    SELECT 1 FROM reviews 
    JOIN projects ON reviews.project_id = projects.id 
    WHERE keywords.review_id = reviews.id AND projects.user_id = auth.uid()
  )
);

-- KPI Cache
CREATE POLICY "Users can manage KPI cache in their projects" ON kpi_cache FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = kpi_cache.project_id AND projects.user_id = auth.uid())
);

-- Feature Requests
CREATE POLICY "Users can manage feature requests in their projects" ON feature_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = feature_requests.project_id AND projects.user_id = auth.uid())
);

-- Recommendations
CREATE POLICY "Users can manage recommendations in their projects" ON recommendations FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = recommendations.project_id AND projects.user_id = auth.uid())
);

-- Trigger for creating profile on auth.signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
