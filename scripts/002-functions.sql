-- Function to safely increment analyses used
CREATE OR REPLACE FUNCTION increment_analyses_used(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_subscriptions 
  SET 
    analyses_used = analyses_used + 1,
    updated_at = NOW()
  WHERE user_subscriptions.user_id = increment_analyses_used.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_subscriptions 
  SET 
    analyses_used = 0,
    reset_date = reset_date + INTERVAL '1 month',
    updated_at = NOW()
  WHERE reset_date <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user analytics
CREATE OR REPLACE FUNCTION get_user_analytics(user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_analyses', COUNT(*),
    'this_month', COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())),
    'companies_analyzed', COUNT(DISTINCT company_name),
    'shared_analyses', (
      SELECT COUNT(*) FROM public.shared_analyses 
      WHERE shared_by = user_id
    ),
    'received_shares', (
      SELECT COUNT(*) FROM public.shared_analyses 
      WHERE shared_with = user_id
    )
  ) INTO result
  FROM public.company_analyses
  WHERE company_analyses.user_id = get_user_analytics.user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
