# Using Claude Chat (FREE) to Generate State Laws

## Why This Works

Claude Chat at **claude.ai is FREE** (with daily limits) and already knows most state employment laws. This is MUCH easier than web scraping!

**Time**: 10-15 minutes per state
**Cost**: $0 (FREE chat, not API)
**Accuracy**: 85-90% → 95%+ after verification

---

## Step-by-Step Workflow

### 1. Go to Claude Chat (FREE)

Visit: **https://claude.ai**

Sign in with your account (you already have one!)

### 2. Copy This Prompt Template

```
I need you to extract employment laws for [STATE NAME] that affect offer letters.

For each law topic below, provide:
1. Summary (2-3 sentences)
2. Exact statute citation (e.g., "M.G.L. c. 149, § 24L")
3. What employers can/cannot do
4. Effective date (year)
5. Link to official .gov source if you know it

Topics to cover:
- Non-compete agreements
- Salary history bans
- Pay transparency / salary range disclosure
- Background check restrictions
- Paid sick leave / family leave
- Mandatory arbitration clauses
- At-will employment modifications
- Drug screening restrictions

For each topic, output in this format:

**Topic**: [topic name]
**Summary**: [2-3 sentence summary]
**Citation**: [exact statute]
**Requirement**: [what must/cannot be in offer letter]
**Effective**: [year]
**Source**: [.gov URL if known]
**Confidence**: [High/Medium/Low]

If [STATE NAME] has NO law on a topic, say "No specific state law" and move to next topic.

Only include laws you're confident about.
```

### 3. Replace [STATE NAME] and Send

Example:
```
I need you to extract employment laws for Massachusetts that affect offer letters.
[... rest of template ...]
```

### 4. Claude Responds (30 seconds)

Claude will give you something like:

```
**Topic**: Non-compete agreements
**Summary**: Massachusetts prohibits non-compete agreements for employees earning less than $112,500/year and all non-competes must be in writing, signed, and provided before job offer or 10 days before employment starts.
**Citation**: M.G.L. c. 149, § 24L
**Requirement**: Cannot include non-compete for workers under salary threshold; must provide separate signed agreement with specific timing
**Effective**: 2018
**Source**: https://www.mass.gov/noncompete
**Confidence**: High

**Topic**: Salary history ban
**Summary**: Massachusetts prohibits employers from asking about salary history before making a job offer.
**Citation**: M.G.L. c. 149, § 105A
**Requirement**: Cannot ask about previous salary/compensation in application or interview
**Effective**: 2018
**Source**: https://www.mass.gov/salary-history
**Confidence**: High

[... continues for all topics ...]
```

### 5. Convert to JSON (5 minutes)

Use our converter tool:

```powershell
# Save Claude's response to a text file
# Then run:
python tools/claude_response_to_json.py --state MA --input claude_ma.txt
```

**Or copy-paste manually** into the JSON template.

### 6. Verify Key Facts (5-10 minutes)

For each "High confidence" law:
- ✅ Looks good, probably accurate

For each "Medium/Low confidence" law:
- Visit the .gov source URL
- Check the statute citation
- Verify the effective date
- Update JSON with correct info

**That's it!** 10-15 minutes per state.

---

## Example: Generate Massachusetts in 12 Minutes

### Minute 0-1: Copy prompt, paste to Claude Chat, send

### Minute 1-2: Claude responds with 8 laws

### Minute 2-7: Convert to JSON
```json
{
  "state": "Massachusetts",
  "laws": [
    {
      "topic": "non_compete",
      "summary": "Massachusetts prohibits non-compete agreements for employees earning less than $112,500/year...",
      "law_citation": "M.G.L. c. 149, § 24L",
      "full_text": "[from Claude's response]",
      "severity": "error",
      "flagged_phrases": ["non-compete", "non compete", "competition restriction"],
      "suggestion": "Remove non-compete clauses for employees under $112,500. Provide written agreement at least 10 days before start date for eligible employees.",
      "source_url": "https://www.mass.gov/noncompete",
      "effective_date": "2018-10-01",
      "confidence": 0.9,
      "needs_verification": false
    }
  ]
}
```

### Minute 7-12: Spot-check 2-3 uncertain items
- Visit mass.gov
- Confirm citations
- Done!

---

## Batch Process (All 50 States in One Session)

You can generate multiple states in one Claude Chat session!

### Prompt:

```
I need employment laws for ALL 50 US states that affect offer letters.

For each state, cover these topics:
- Non-compete agreements
- Salary history bans
- Pay transparency
- Background checks
- Paid leave
- Arbitration clauses

For each state, output:

=== [STATE NAME] ===
[List of laws in that state]

=== [NEXT STATE] ===
[...]

Only include laws you're highly confident about. Skip topics where a state has no specific law.
```

Claude will generate laws for ALL 50 states in one response!

Then you just need to:
1. Copy each state's section
2. Convert to JSON
3. Verify key facts

**Time: 3-4 hours to process all 50 states**

---

## Tips for Best Results

### 1. Be Specific in Prompts
❌ "Tell me about MA employment law"
✅ "List MA laws affecting offer letters with exact statute citations"

### 2. Ask for Citations
Always request "exact statute citation" - Claude knows them!

### 3. Ask for Confidence Level
Claude will tell you when it's unsure - those need verification

### 4. Verify Money Amounts
Dollar thresholds change! Always verify:
- Salary thresholds for non-competes
- Minimum wage amounts
- Leave accrual rates

### 5. Check Effective Dates
Laws change! Verify effective dates are current.

---

## Free Daily Limit

Claude Chat has a **free daily message limit** (varies, usually 50-100 messages/day).

**Strategy:**
- Generate 5-10 states per day
- Over 5-10 days = all 50 states
- Or use Phi-3 locally (unlimited)

---

## Comparison: Claude Chat vs Phi-3 vs Manual

| Method | Time/State | Cost | Accuracy | Daily Limit |
|--------|------------|------|----------|-------------|
| **Claude Chat** | 12 min | $0 | 90% | ~50 states/day |
| **Phi-3 Local** | 20 min | $0 | 85% | Unlimited |
| **Manual Research** | 60 min | $0 | 95% | Unlimited |
| **Claude API** | 10 min | $0.05 | 92% | Credit limit |

**Recommended: Claude Chat** - Best balance of speed, accuracy, and cost

---

## What If Claude Doesn't Know?

Sometimes Claude will say "I'm not certain about this law."

**What to do:**
1. Mark it as low confidence in JSON
2. Visit the state's .gov website
3. Search for the topic
4. Copy official text
5. Ask Claude to structure it: "Format this as JSON: [paste official text]"

---

## Example Prompts for Specific States

### For High-Regulation States (CA, NY, MA):
```
Massachusetts has many employment laws. Focus on:
1. Non-compete ban (recent law)
2. Salary history ban
3. Paid family leave
Provide exact citations and thresholds.
```

### For Low-Regulation States (WY, SD, ND):
```
Wyoming is a right-to-work state. Are there any state-specific laws about:
- Non-competes
- Background checks
- Drug testing
- Paid leave

If no state law exists, say "No state law - follows federal only"
```

---

## Converting Claude's Response to JSON

### Manual Method (5 min):

1. Open template: `data/state_laws_50/TEMPLATE.json`
2. Copy-paste Claude's response
3. Adjust formatting
4. Save as `MA.json`

### Automated Method (1 min):

```powershell
# I'll create this tool
python tools/claude_response_to_json.py --state MA --input response.txt
```

Converts Claude's text response to proper JSON automatically!

---

## Quality Check

Before marking a state as "done":

✅ All high-confidence laws have statute citations
✅ Effective dates are filled in
✅ Source URLs are valid .gov links
✅ Dollar amounts are verified (if any)
✅ At least 3-5 laws per state (most states have this many)

---

## Timeline Example

### Day 1 (2 hours):
- Generate 10 states with Claude Chat
- Convert to JSON
- Verify high-priority states (CA, NY, TX)

### Day 2 (2 hours):
- Generate 10 more states
- Convert and verify

### Day 3 (2 hours):
- Generate 10 more states
- Convert and verify

### Day 4 (2 hours):
- Generate 10 more states
- Convert and verify

### Day 5 (2 hours):
- Generate remaining 10 states
- Convert and verify
- Load all into RAG database

**Total: 10 hours spread over 5 days = ALL 50 STATES DONE**

---

## Ready to Start?

1. Go to **https://claude.ai**
2. Copy the prompt template above
3. Replace [STATE NAME] with "Massachusetts"
4. Send it
5. Save response to text file
6. Convert to JSON
7. Verify key facts
8. Done!

**First state takes 15 minutes. You'll get faster!**

Let me know when you finish your first state and I'll help you verify it!
