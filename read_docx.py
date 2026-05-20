import zipfile
import xml.etree.ElementTree as ET

filepath = r'C:\Users\lesin\OneDrive\Desktop\ВСЕ МОИ КУРСАЧИ\ВКР_Алешин 01.05.26.docx'
output_path = r'C:\Users\lesin\OneDrive\Рабочий стол\conference_site\vkr_content.txt'

def read_docx_native(path):
    paragraphs = []
    with zipfile.ZipFile(path, 'r') as z:
        with z.open('word/document.xml') as f:
            tree = ET.parse(f)
            root = tree.getroot()
            
            for para in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                texts = []
                for run in para.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
                    if run.text:
                        texts.append(run.text)
                paragraph_text = ''.join(texts)
                paragraphs.append(paragraph_text)
    
    return paragraphs

if __name__ == '__main__':
    paragraphs = read_docx_native(filepath)
    with open(output_path, 'w', encoding='utf-8') as f:
        for p in paragraphs:
            if p.strip():
                f.write(p + '\n')
    print(f"Done! Saved to {output_path}")
