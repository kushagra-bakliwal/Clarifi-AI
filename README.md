#CLARIFI AI
In the modern digital marketplace, businesses receive thousands of customer reviews
daily across multiple platforms such as Amazon, the App Store, and email channels.
Approximately 80% of this feedback exists as unstructured text, making it extremely difficult
and time-consuming to analyze manually. Traditional star-rating systems fail to capture
contextual sentiment, nuanced complaints, or specific feature requests embedded within written
reviews.
Clarifi AI is a Generative AI-powered Intelligent Customer Feedback Analysis System
designed to address this challenge. The system automates the end-to-end processing of raw
customer reviews using Google's Gemini Pro Large Language Model (LLM). It extracts
sentiment (Positive, Negative, Neutral), classifies reviews into business-relevant categories
such as UI/UX, Performance, Pricing, and Bugs, and generates concise one-sentence summaries
(TL;DR) for long reviews.
The system is built using Python 3.10+, integrates the Google Gemini API for natural
language understanding, and presents results through an interactive Streamlit web dashboard.
Product Managers and Business Analysts can upload CSV datasets, apply filters by sentiment
or category, view key performance indicators (KPIs), and export processed data — all without
writing a single line of code.
Advanced features include urgency and priority detection for critical issues, feature
request extraction, AI-powered actionable recommendations, trend analysis via time-series
charts, and a 'Chat with Your Data' co-pilot for natural language queries over the uploaded
dataset.
The system is designed to be platform-independent, secure (API keys stored as
environment variables), and usable by first-time users within two minutes of launch. This
project demonstrates a practical application of Generative AI in business intelligence and NLPdriven analytics.

# 🎉 Backend Integration Complete!

Your Clarifi AI dashboard now has a **fully functional backend** with real data processing!

## ✅ What's Working

### **Backend Server**
✅ CSV upload and parsing
✅ AI-powered sentiment analysis
✅ Keyword extraction
✅ TL;DR summary generation
✅ Urgency detection (critical/high/medium/low)
✅ Feature request identification
✅ KPI calculation (ratings, sentiment, counts)
✅ AI recommendations generation
✅ Chat interface with natural language queries
✅ Supabase Storage for file uploads

### **Frontend Components**
✅ Dashboard - Live KPI cards with real metrics
✅ Sentiment Distribution Chart - Real percentages
✅ Keywords Word Cloud - Actual negative keywords
✅ Review Insights Table - All reviews with AI summaries
✅ AI Recommendations Panel - Generated insights
✅ Feature Requests Panel - Detected requests
✅ Chat with Data Page - Query your data
✅ Floating Chat Button - AI assistant everywhere
✅ Upload Modal - CSV drag-and-drop with progress
✅ Full dark mode support

## 🚀 How to Test

### 1. Create Sample CSV
Copy this and save as `reviews.csv`:

```csv
Review Text,Rating,Date,Customer Name,Source
"Amazing product! Love the new features",5,2024-02-20,Alice,App Store
"Login broken - urgent fix needed!",1,2024-02-19,Bob,Support
"Good but pricing is too high",3,2024-02-18,Carol,Website
"Crashes constantly on Android",1,2024-02-21,David,Google Play
"Export feature saves so much time!",5,2024-02-17,Emma,App Store
"Very slow to load pages",2,2024-02-22,Frank,Twitter
"Need API for integrations",4,2024-02-16,Grace,Email
"Freezes with large files",2,2024-02-23,Henry,Support
"Best feedback tool I've used!",5,2024-02-15,Isabel,G2
"Would love offline support",4,2024-02-14,Jack,Feature Request
```

### 2. Upload in Dashboard
1. Click the **"+"** button (top right)
2. Drag/drop your CSV or click to browse
3. Click **"Upload & Analyze"**
4. Wait 2-5 seconds ⏳
5. See results! 🎉

### 3. Explore Your Data
After upload, check:
- **KPI Cards** → Total reviews, avg rating, critical issues
- **Charts** → Sentiment distribution pie chart
- **Review Table** → All reviews with AI summaries (click to expand)
- **Word Cloud** → Negative keywords visualization
- **Recommendations** → AI-generated action items
- **Feature Requests** → Automatically detected requests

### 4. Chat with Your Data
Click "Chat with Data" or use the floating chat button:

**Try these questions:**
- "How many reviews do we have?"
- "What's the overall sentiment?"
- "Show me critical issues"
- "What are the top feature requests?"
- "What are the most common problems?"
- "Summarize negative feedback"

## 🤖 AI Features Explained

### Sentiment Analysis
Classifies each review as **positive**, **negative**, or **neutral** based on:
- Star rating (if provided)
- Keywords and phrases
- Context analysis

### TL;DR Summaries
Generates concise summaries showing:
- Main sentiment expressed
- Key topics mentioned
- Actionable insights

### Priority Scoring
Assigns urgency levels:
- **🔴 Critical** - Urgent bugs, severe issues
- **🟠 High** - Important problems
- **🔵 Medium** - General feedback
- **⚪ Low** - Positive feedback, minor items

### Keyword Extraction
Identifies most mentioned terms in:
- Negative reviews (for word cloud)
- Feature requests
- Bug reports
- General themes

### Feature Request Detection
Automatically finds requests using phrases:
- "would love..."
- "please add..."
- "need feature..."
- "missing..."
- "wish there was..."

### AI Recommendations
Generates actionable recommendations with:
- **Impact level** (high/medium/low)
- **Priority** (critical/high/medium/low)
- **Category** (Bug Fix, UX, Feature, etc.)
- **Effort estimate** (1-2 weeks, 2-4 weeks, etc.)
- **Affected users** count

## 📊 CSV Format Guidelines

**Required columns** (flexible names):
- `Review Text` / `text` / `review` / `comment`
- `Rating` / `rating` / `stars` (1-5)

**Optional columns:**
- `Date` / `date` (defaults to today)
- `Customer Name` / `name` / `customer`
- `Source` / `source` (defaults to "CSV Upload")

**Example formats that work:**
```csv
text,rating,date,name,source
review,stars,date,customer,platform
Review Text,Rating,Date,Customer Name,Source
```

## 🔧 API Endpoints Reference

Base URL: `https://[project-id].supabase.co/functions/v1/make-server-77f42fb8`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/upload-csv` | POST | Upload CSV (multipart/form-data) |
| `/reviews` | GET | Get all processed reviews |
| `/kpis` | GET | Get calculated KPIs |
| `/feature-requests` | GET | Get extracted feature requests |
| `/recommendations` | GET | Get AI recommendations |
| `/chat` | POST | Query data (JSON: {query: "..."}) |
| `/data` | DELETE | Clear all data (testing) |

## 🎨 What Gets Calculated

After uploading reviews, the backend calculates:

### KPIs
- Total reviews count
- Positive/negative/neutral counts
- Average rating (1-5 stars)
- Average sentiment score (0-1)
- Critical issues count
- Feature requests count

### Insights
- Top 20 negative keywords (for word cloud)
- Priority distribution
- Source breakdown
- Feature request list
- AI recommendations (up to 3)

## 💡 Pro Tips

1. **Upload regularly** - More data = better insights
2. **Mix sources** - App Store, Support, Social Media
3. **Include dates** - Track trends over time
4. **Use chat feature** - Natural language queries
5. **Check recommendations** - Actionable next steps
6. **Monitor critical issues** - Address urgent items first

## 🐛 Troubleshooting

**Upload fails?**
- Check CSV format (comma-separated)
- Ensure headers in first row
- Verify file size < 50MB
- Check browser console for errors

**No data showing?**
- Refresh the page
- Check network tab for failed requests
- Verify CSV was processed successfully
- Look for error messages in upload modal

**Chat not responding?**
- Ensure you've uploaded data first
- Check internet connection
- Look for errors in console
- Try simpler questions first

## 🔐 Security Notes

- Files stored in private Supabase bucket
- Data accessible only via authenticated API
- No PII is logged or exposed
- Use for prototyping/internal tools

## 🚀 Next Steps

Want to enhance? Consider:

1. **OpenAI Integration** - Better summaries with GPT
2. **Real-time Connectors** - Auto-sync from App Store, etc.
3. **Email Alerts** - Notify on critical issues
4. **Scheduled Reports** - Daily/weekly summaries
5. **Team Features** - Multi-user collaboration
6. **Advanced Analytics** - Trend analysis, cohorts

## 📖 Documentation Files

- `BACKEND_GUIDE.md` - Detailed backend documentation
- `SAMPLE_CSV_GUIDE.md` - CSV format examples
- `QUICK_START.md` - Fast getting started guide

---

## 🎉 You're Ready!

Everything is set up and working. Upload your first CSV to see the AI in action!

**Questions? Check browser console (F12) for detailed logs.**
