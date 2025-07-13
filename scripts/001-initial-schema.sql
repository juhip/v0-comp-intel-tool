-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT DEFAULT 'analyst',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company_analyses table
CREATE TABLE public.company_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  company_name TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  competitive_data JSONB,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  is_public BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  analyses_used INTEGER DEFAULT 0,
  analyses_limit INTEGER DEFAULT 5,
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shared_analyses table for team collaboration
CREATE TABLE public.shared_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES public.company_analyses(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) NOT NULL,
  shared_with UUID REFERENCES auth.users(id) NOT NULL,
  permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analysis_history table for tracking changes
CREATE TABLE public.analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES public.company_analyses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  changes JSONB NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'shared', 'exported')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_company_analyses_user_id ON public.company_analyses(user_id);
CREATE INDEX idx_company_analyses_company_name ON public.company_analyses(company_name);
CREATE INDEX idx_company_analyses_created_at ON public.company_analyses(created_at DESC);
CREATE INDEX idx_shared_analyses_shared_with ON public.shared_analyses(shared_with);
CREATE INDEX idx_analysis_history_analysis_id ON public.analysis_history(analysis_id);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User profiles: users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Company analyses: users can see their own analyses and shared analyses
CREATE POLICY "Users can view own analyses" ON public.company_analyses
  FOR SELECT USING (
    auth.uid() = user_id OR 
    is_public = true OR
    id IN (
      SELECT analysis_id FROM public.shared_analyses 
      WHERE shared_with = auth.uid()
    )
  );

CREATE POLICY "Users can insert own analyses" ON public.company_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON public.company_analyses
  FOR UPDATE USING (
    auth.uid() = user_id OR
    id IN (
      SELECT analysis_id FROM public.shared_analyses 
      WHERE shared_with = auth.uid() AND permission = 'edit'
    )
  );

CREATE POLICY "Users can delete own analyses" ON public.company_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- User subscriptions: users can only see their own subscription
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Shared analyses policies
CREATE POLICY "Users can view shared analyses" ON public.shared_analyses
  FOR SELECT USING (
    auth.uid() = shared_by OR 
    auth.uid() = shared_with
  );

CREATE POLICY "Users can create shares" ON public.shared_analyses
  FOR INSERT WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can delete own shares" ON public.shared_analyses
  FOR DELETE USING (auth.uid() = shared_by);

-- Analysis history policies
CREATE POLICY "Users can view analysis history" ON public.analysis_history
  FOR SELECT USING (
    auth.uid() = user_id OR
    analysis_id IN (
      SELECT id FROM public.company_analyses 
      WHERE user_id = auth.uid() OR
      id IN (
        SELECT analysis_id FROM public.shared_analyses 
        WHERE shared_with = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert analysis history" ON public.analysis_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
