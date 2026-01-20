# Data Collection Guide - Smart Strategies (Token Efficient!)

**Problem:** We need 14 more states but don't want to waste this conversation's tokens on data research.

**Solution:** Multiple efficient strategies that DON'T consume your coding session!

---

## ✅ STRATEGY 1: Manual Copy-Paste + Template (FASTEST - 30 min/state)

### Step-by-Step Process:

#### Step 1: Find Official Source
Go to the state's official labor department website:
- Google: "[State Name] employment law offer letter requirements"
- Target: `.gov` websites only
- Look for: Employment law guides, employer handbooks

**Example sources:**
- Massachusetts: `https://www.mass.gov/guides/employee-rights`
- Colorado: `https://cdle.colorado.gov`
- Oregon: `https://www.oregon.gov/boli`
- Pennsylvania: `https://www.dli.pa.gov`

#### Step 2: Copy Relevant Text
Copy these sections:
- Non-compete restrictions
- Salary history bans
- Pay transparency
- Background check timing
- Paid leave requirements
- Wage/hour requirements

Save to a text file: `ma_laws.txt`

#### Step 3: Run Our Converter Script
```bash
cd python-nlp/tools
python doc_to_state_json.py --state MA --name Massachusetts --file ma_laws.txt
```

#### Step 4: Fill in the Template
The script creates `data/state_laws_20/MA.json` with placeholders:
```json
{
  "topic": "non_compete",
  "summary": "[FILL IN: Brief summary]",  ← FILL THIS IN
  "law_citation": "[FILL IN: Statute]",   ← FILL THIS IN
  ...
}
```

Open the file and fill in the `[FILL IN: ...]` parts using the text you copied.

**Time: 30-45 minutes per state**

---

## ✅ STRATEGY 2: Use Separate Claude Session (TOKEN EFFICIENT!)

### How to Do This:

1. **Open a NEW Claude conversation** (separate from this one)
2. Use this prompt:

```
I need you to research [STATE NAME] employment law requirements for offer letters.

Create a JSON file with this EXACT structure:

{
  "state": "[State Name]",
  "state_code": "[XX]",
  "last_updated": "2025-01-12",
  "data_sources": [
    {
      "url": "[official .gov source]",
      "title": "[source title]"
    }
  ],
  "laws": [
    {
      "topic": "non_compete",
      "summary": "Brief 2-3 sentence summary",
      "law_citation": "Exact statute reference",
      "full_text": "Detailed explanation of the law",
      "severity": "error|warning|info",
      "flagged_phrases": ["phrase1", "phrase2"],
      "suggestion": "How to fix violations",
      "source_url": "Official government URL",
      "effective_date": "2025-01-01"
    }
  ]
}

Research these topics:
1. Non-compete restrictions
2. Salary history bans
3. Pay transparency requirements
4. Background check timing
5. Paid leave mandates
6. Exempt salary thresholds
7. Arbitration clauses
8. Drug testing policies

Use ONLY official .gov sources. Cite exact statutes.
```

3. Copy the JSON output to `data/state_laws_20/MA.json`
4. Verify accuracy (spot-check 2-3 laws)

**Time: 15-20 minutes per state**
**Cost: FREE (separate conversation)**

---

## ✅ STRATEGY 3: Use Existing Compliance Databases (SMART!)

### Free Resources You Can Use:

#### A) SHRM State Law Summaries (FREE)
- Website: `https://www.shrm.org/topics-tools/tools/state-law`
- Has 50-state summaries
- Copy relevant sections
- Use our converter script

#### B) Department of Labor State Pages
- Website: `https://www.dol.gov/agencies/whd/state`
- Official federal compilation
- Links to each state's page

#### C) NCSL (National Conference of State Legislatures)
- Website: `https://www.ncsl.org/labor-and-employment`
- Free state-by-state guides
- Well-organized by topic

### Process:
1. Visit one of these sites
2. Copy the text for your target state
3. Save to `state_laws.txt`
4. Run converter: `python doc_to_state_json.py --state MA --name Massachusetts --file state_laws.txt`
5. Fill in template

---

## ✅ STRATEGY 4: Hybrid Approach (RECOMMENDED!)

### For Next 4 States (MA, CO, OR, PA):

**Massachusetts (MA):**
- Use SHRM summary + Mass.gov
- Time: 30 minutes

**Colorado (CO):**
- Use Colorado Department of Labor site
- Time: 30 minutes

**Oregon (OR):**
- Use Oregon BOLI (Bureau of Labor and Industries)
- Time: 30 minutes

**Pennsylvania (PA):**
- Use PA Department of Labor & Industry
- Time: 30 minutes

**Total: 2 hours for 4 states!**

Then you have **10 states total** (CA, NY, TX, FL, IL, WA, MA, CO, OR, PA) covering ~70% of US workforce.

---

## 📝 EXAMPLE: Let Me Show You

Here's what a filled-in law looks like:

**BEFORE (template):**
```json
{
  "topic": "non_compete",
  "summary": "[FILL IN: Brief summary]",
  "law_citation": "[FILL IN: Statute]",
  "full_text": "[FILL IN: Details]",
  "severity": "error",
  "flagged_phrases": ["[FILL IN]"],
  "suggestion": "[FILL IN: Fix]",
  "source_url": "https://ma.gov/labor",
  "effective_date": "2025-01-01"
}
```

**AFTER (filled in):**
```json
{
  "topic": "non_compete",
  "summary": "Massachusetts restricts non-compete agreements. Must be reasonable in scope, duration (max 1 year), and geography. Employee must receive 'garden leave' or other consideration.",
  "law_citation": "Massachusetts General Laws Chapter 149, Section 24L",
  "full_text": "Non-compete agreements are enforceable only if: (1) necessary to protect legitimate business interest, (2) reasonable in time (12 months max for most employees), (3) reasonable in geography, (4) employee receives garden leave or other fair consideration. Cannot be used for non-exempt employees, students, workers under 18, or workers terminated without cause.",
  "severity": "error",
  "flagged_phrases": ["non-compete", "noncompete", "competitive employment", "restraint of trade"],
  "suggestion": "Ensure non-compete meets MA requirements: 12 month max, reasonable geography, garden leave provision. Cannot use for non-exempt employees.",
  "source_url": "https://www.mass.gov/guides/noncompete-agreements",
  "effective_date": "2018-10-01"
}
```

---

## ⏱️ TIME ESTIMATES

| Strategy | Time per State | Accuracy | Token Cost |
|----------|---------------|----------|------------|
| Manual copy-paste + template | 30-45 min | High | 0 tokens (this session) |
| Separate Claude session | 15-20 min | Very High | 0 tokens (this session) |
| SHRM/DOL databases | 20-30 min | High | 0 tokens |
| Hybrid (recommended) | 25-35 min | Very High | 0 tokens |

**To complete 14 states:**
- Hybrid approach: ~6-8 hours total
- Can split across team members
- Can do 2-3 states per day

---

## 🎯 MY RECOMMENDATION FOR YOU

### This Week (Days 1-2):
1. **Convert existing 6 states** ✅ DONE!
   - CA, NY, TX, FL, IL, WA

2. **Add next 4 states using separate Claude sessions** (4 hours)
   - MA, CO, OR, PA
   - 1 hour per state using Strategy 2

### Next Week (Days 3-7):
3. **Add final 10 states** (10 hours)
   - Use hybrid: SHRM summaries + separate Claude sessions
   - 1 hour per state
   - Can parallelize if you have team members

**Total effort: ~14 hours for 20 states**
**Token cost to this session: ZERO!** 🎉

---

## 🚀 WHAT TO DO RIGHT NOW

1. **Test the system with existing 6 states:**
   ```bash
   cd python-nlp
   pip install -r requirements_v2.txt
   python test_compliance_v2.py
   ```

2. **Pick ONE state to add** (I recommend Massachusetts):
   - Visit: https://www.mass.gov/guides/noncompete-agreements
   - Copy text to `ma_laws.txt`
   - Run converter
   - Fill in template
   - Test it!

3. **Once you verify it works:**
   - Use the same process for CO, OR, PA
   - Then tackle the final 10

---

**Want me to help with anything else while we still have tokens?**
- Create the web scraper skeleton?
- Build Flask API endpoints?
- Show you how to test the multi-layer analyzer?

Let me know! 🚀
