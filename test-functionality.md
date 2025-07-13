# Testing Your Dashboard

## 1. Basic Functionality Test
- Search for "Apple" 
- Should see comprehensive company data
- Check if data is from API (detailed) or sample (basic)

## 2. API Status Check
- Look for colored badges at top showing API status
- Green = Configured and working
- Gray = Not configured

## 3. Competitive Analysis Test
- After searching a company, click "Competitive Intelligence" tab
- Click "Load Competitive Analysis" 
- Should see competitor data and market analysis

## 4. Export Test
- After loading company data, click "Export Data"
- Should download JSON file with complete analysis

## 5. Error Handling Test
- Try searching for a very obscure company
- Should gracefully fall back to sample data
- Check browser console for API call logs
