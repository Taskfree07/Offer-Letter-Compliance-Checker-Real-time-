"""
Generate compliance rules for all 50 states from JSON data
"""
import json
import os
from pathlib import Path

# States already in complianceRules.js
existing_states = {'CA', 'NY', 'TX', 'WA', 'FL', 'IL'}

# State code to name mapping
state_names = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming'
}

# Reverse mapping
name_to_code = {v.lower(): k for k, v in state_names.items()}
name_to_code.update({k.lower(): k for k in state_names.keys()})

def get_state_code(filename):
    """Extract state code from filename"""
    name = filename.lower()
    # Remove common suffixes
    for suffix in ['_employment_laws', '_laws', 'employment_laws']:
        name = name.replace(suffix, '')
    name = name.strip('_').replace('_', ' ')

    # Try direct match
    if name.upper() in state_names:
        return name.upper()

    # Try name lookup
    if name in name_to_code:
        return name_to_code[name]

    # Try partial match
    for state_name, code in name_to_code.items():
        if state_name in name or name in state_name:
            return code if len(code) == 2 else name_to_code.get(code.lower())

    return None

def escape_js(s):
    """Escape string for JavaScript"""
    if not s:
        return ''
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ').replace('\r', '')

def generate_state_rules(state_code, data, state_name):
    """Generate JavaScript code for a state's rules"""
    lines = []
    lines.append(f'\n  // ==================== {state_name.upper()} ====================')
    lines.append(f'  {state_code}: {{')
    lines.append(f"    state: '{state_name}',")
    lines.append(f"    lastUpdated: '2026-01-19',")
    lines.append(f'    sources: [{{ url: "https://{state_code.lower()}.gov/labor", title: "{state_name} Department of Labor" }}],')
    lines.append('    rules: {')

    # Check for 'rules' format (frontend style)
    if 'rules' in data and isinstance(data['rules'], dict):
        rules = data['rules']
        for rule_name, rule_data in rules.items():
            if not isinstance(rule_data, dict):
                continue

            severity = rule_data.get('severity', 'info')
            message = escape_js(rule_data.get('message', ''))[:200]
            law_ref = escape_js(rule_data.get('lawReference', ''))
            explanation = escape_js(rule_data.get('detailedExplanation', rule_data.get('explanation', '')))[:300]
            suggestion = escape_js(rule_data.get('suggestion', ''))
            phrases = rule_data.get('flaggedPhrases', [])

            lines.append(f'      {rule_name}: {{')
            lines.append(f"        severity: '{severity}',")
            if law_ref:
                lines.append(f"        lawReference: '{law_ref}',")
            lines.append(f"        message: '{message}',")
            if explanation:
                lines.append(f"        detailedExplanation: '{explanation}',")
            if phrases and isinstance(phrases, list):
                phrases_str = ', '.join([f"'{escape_js(str(p))}'" for p in phrases[:5]])
                lines.append(f"        flaggedPhrases: [{phrases_str}],")
            if suggestion:
                lines.append(f"        suggestion: '{suggestion}'")
            lines.append('      },')

    # Check for 'laws' format (backend RAG style)
    elif 'laws' in data and isinstance(data['laws'], list):
        laws = data['laws']
        for law in laws:
            if not isinstance(law, dict):
                continue

            topic = law.get('topic', 'general')
            topic = topic.replace('-', '_').replace(' ', '_').replace('.', '_')

            # Determine severity based on content
            summary = law.get('summary', '')
            severity = 'info'
            if 'prohibited' in summary.lower() or 'banned' in summary.lower() or 'void' in summary.lower():
                severity = 'error'
            elif 'required' in summary.lower() or 'must' in summary.lower():
                severity = 'warning'

            citation = escape_js(law.get('statute_citation', ''))
            summary_escaped = escape_js(summary)[:200]

            lines.append(f'      {topic}: {{')
            lines.append(f"        severity: '{severity}',")
            if citation:
                lines.append(f"        lawReference: '{citation}',")
            lines.append(f"        message: '{summary_escaped}',")
            lines.append(f"        flaggedPhrases: ['{topic.replace('_', ' ')}']")
            lines.append('      },')

    lines.append('    }')
    lines.append('  },')

    return lines

def main():
    data_dir = Path(r'C:\Users\valla\Desktop\Offer-Letter-Compliance-Checker-Real-time-\python-nlp\data\state_laws_final')
    output_lines = []
    states_added = []

    for json_file in sorted(data_dir.glob('*.json')):
        state_code = get_state_code(json_file.stem)

        if not state_code:
            print(f"Warning: Could not determine state code for {json_file.name}")
            continue

        if state_code in existing_states:
            continue

        if state_code in states_added:
            continue

        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"Error reading {json_file.name}: {e}")
            continue

        state_name = state_names.get(state_code, state_code)

        rules_lines = generate_state_rules(state_code, data, state_name)
        if len(rules_lines) > 8:  # Has actual rules
            output_lines.extend(rules_lines)
            states_added.append(state_code)
            print(f"Added {state_code} ({state_name})")

    # Write output
    output_file = Path(r'C:\Users\valla\Desktop\Offer-Letter-Compliance-Checker-Real-time-\python-nlp\new_state_rules.js')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output_lines))

    print(f"\n{'='*60}")
    print(f"Generated rules for {len(states_added)} states")
    print(f"Output saved to: {output_file}")
    print(f"States: {', '.join(sorted(states_added))}")

if __name__ == '__main__':
    main()
