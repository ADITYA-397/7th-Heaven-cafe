import json
import re

transcript_path = r'C:\Users\Aditya\.gemini\antigravity-ide\brain\4d40ab23-2901-4805-99a5-b8dbbf99a282\.system_generated\logs\transcript_full.jsonl'
target_lines = []
found = False

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if 'Showing lines 440 to 695' in data.get('content', ''):
            content = data['content']
            for l in content.split('\n'):
                if l.startswith('440:') or found:
                    found = True
                    m = re.match(r'^\d+:\s?(.*)', l)
                    if m:
                        target_lines.append(m.group(1))
                    else:
                        if 'The above content does NOT show' in l:
                            break
            break

missing_lines = [
    '            <p style={{ fontSize: \'1.25rem\', color: \'#5C4A3E\', opacity: 0.6, marginBottom: \'4rem\' }}>{orderCompleteMsg}</p>',
    '            <button ',
    '                onClick={() => { setOrderCompleteMsg(\'\'); setIsCartOpen(false); }}',
    '                style={{ backgroundColor: \'#8C6A53\', color: \'#fff\', border: \'none\', width: \'100%\', padding: \'2rem\', borderRadius: \'2.5rem\', fontSize: \'1.2rem\', fontWeight: 800, letterSpacing: \'0.2em\', cursor: \'pointer\' }}',
    '                className=\"shadow-xl\"',
    '            >',
    '              DONE',
    '            </button>',
    '          </div>',
    '        </div>',
    '      )}'
]

footer_lines = [
    '',
    '      <InvoiceModal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} order={lastOrder} />',
    '    </>',
    '  );',
    '}'
]

file_path = r'c:\Users\Aditya\Desktop\cafe2\components\CartDrawer.js'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

new_lines = lines[:438] + target_lines + missing_lines + footer_lines
new_content = '\n'.join(new_lines)

# FIX ENCODING
new_content = new_content.replace('\u20b9', '&#8377;')
new_content = new_content.replace('₹', '&#8377;')
new_content = new_content.replace('–', '-')
new_content = new_content.replace('\u2013', '-')
new_content = new_content.replace('─', '')
new_content = new_content.replace('✓', '&#10003;')
new_content = new_content.replace('\u2713', '&#10003;')

# Fix 1: Stray line above Add instruction for courier
divider_str = '''                  {/* Divider */}
                  <div style={{ height: 1, backgroundColor: '#f0f0f0', margin: '12px 0' }}></div>'''
new_content = new_content.replace(divider_str, '')

# Fix 2: Add instruction for courier underline
new_content = new_content.replace('textDecoration: \'underline\'', 'textDecoration: \'none\'')

# Fix 3: Increase Modal Size
modal_style = 'style={{ width: \'min(96vw, 1020px)\', maxHeight: \'92vh\', backgroundColor: \'#f0f0f0\' }}'
new_modal_style = 'style={{ width: \'min(96vw, 1100px)\', minHeight: \'700px\', backgroundColor: \'#f0f0f0\' }}'
new_content = new_content.replace(modal_style, new_modal_style)

# Fix 4: I don't want rounded page
wrapper_class = 'className=\"flex shadow-2xl font-sans text-gray-800 rounded-2xl overflow-hidden\"'
new_wrapper_class = 'className=\"flex shadow-2xl font-sans text-gray-800 overflow-hidden\"'
new_content = new_content.replace(wrapper_class, new_wrapper_class)

# Fix 5: ADD CARD button clipped. 
btn_style = 'style={{ flexShrink: 0, padding: \'7px 16px\', border: \'1.5px solid #ff6036\', color: \'#ff6036\', borderRadius: \'999px\', fontSize: \'12px\', fontWeight: 700, background: \'transparent\', cursor: \'pointer\', whiteSpace: \'nowrap\' }}'
new_btn_style = 'style={{ flexShrink: 0, padding: \'7px 16px\', border: \'1.5px solid #ff6036\', color: \'#ff6036\', borderRadius: \'999px\', fontSize: \'12px\', fontWeight: 700, background: \'transparent\', cursor: \'pointer\', whiteSpace: \'normal\' }}'
new_content = new_content.replace(btn_style, new_btn_style)

# Fix 6: Empty gap & Padding (push continue button to bottom)
left_scroll_wrapper = '<div className=\"flex-1 overflow-y-auto\" style={{ padding: \'0 16px 16px\' }}>'
new_left_scroll_wrapper = '<div className=\"flex-1 overflow-y-auto flex flex-col\" style={{ padding: \'0 16px 16px\' }}>'
new_content = new_content.replace(left_scroll_wrapper, new_left_scroll_wrapper)

continue_btn = 'style={{ width: \'100%\', padding: \'15px\', borderRadius: \'12px\', background: \'#ff6036\', color: \'#fff\', fontWeight: 700, fontSize: \'15px\', border: \'none\', cursor: \'pointer\', boxShadow: \'0 4px 16px rgba(255,96,54,0.3)\', letterSpacing: \'0.01em\' }}'
new_continue_btn = 'style={{ width: \'100%\', padding: \'15px\', borderRadius: \'12px\', background: \'#ff6036\', color: \'#fff\', fontWeight: 700, fontSize: \'15px\', border: \'none\', cursor: \'pointer\', boxShadow: \'0 4px 16px rgba(255,96,54,0.3)\', letterSpacing: \'0.01em\', marginTop: \'auto\' }}'
new_content = new_content.replace(continue_btn, new_continue_btn)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
