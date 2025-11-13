#!/usr/bin/env python3
# build_projects_manifest.py
# Scan ./_projects and generate manifest.json with project metadata
import os, json, re
from pathlib import Path

ROOT = Path(__file__).parent
PROJECTS_DIR = ROOT / "_projects"

def parse_yaml_frontmatter(content):
    """Parse YAML front-matter from markdown content"""
    obj = {}
    # Match front-matter between --- markers
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', content, re.DOTALL)
    if not match:
        return obj, content
    
    yaml_text = match.group(1)
    body = match.group(2)
    
    # Simple YAML parser for key: value pairs
    for line in yaml_text.split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        
        # Match key: value
        m = re.match(r'^([A-Za-z0-9_-]+)\s*:\s*(.*)$', line)
        if not m:
            continue
        
        key = m.group(1)
        value = m.group(2).strip()
        
        # Handle array values [a, b, c]
        if value.startswith('[') and value.endswith(']'):
            value = [v.strip().strip('"\'') for v in value[1:-1].split(',') if v.strip()]
        # Handle quoted strings
        elif (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
            value = value[1:-1]
        
        obj[key] = value
    
    return obj, body

def extract_description(body):
    """Extract first paragraph or blockquote as description"""
    lines = body.strip().split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Remove markdown blockquote marker
        if line.startswith('>'):
            return line[1:].strip()
        # Use first paragraph
        if line and not line.startswith('#') and not line.startswith('```'):
            # Remove markdown links and images
            line = re.sub(r'!\[.*?\]\(.*?\)', '', line)
            line = re.sub(r'\[.*?\]\(.*?\)', '', line)
            return line[:150] + ('...' if len(line) > 150 else '')
    return ""

def scan_projects():
    """Scan _projects directory and extract project metadata"""
    projects = []
    
    if not PROJECTS_DIR.exists():
        print(f"Error: {PROJECTS_DIR} does not exist")
        return projects
    
    for project_dir in sorted(PROJECTS_DIR.iterdir()):
        if not project_dir.is_dir() or project_dir.name.startswith('.') or project_dir.name == 'thumbs':
            continue
        
        # Look for .md files in the project directory
        md_files = list(project_dir.glob('*.md'))
        if not md_files:
            print(f"Warning: No .md file found in {project_dir.name}")
            continue
        
        # Use the first .md file found (or prefer <dirname>.md)
        md_file = None
        preferred_name = f"{project_dir.name}.md"
        for f in md_files:
            if f.name == preferred_name:
                md_file = f
                break
        if not md_file:
            md_file = md_files[0]
        
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            fm, body = parse_yaml_frontmatter(content)
            
            # Required fields
            if not all(k in fm for k in ['title', 'level', 'tags', 'cover']):
                missing = [k for k in ['title', 'level', 'tags', 'cover'] if k not in fm]
                print(f"Warning: {project_dir.name} missing required fields: {missing}")
                continue
            
            # Extract description from body if not in front-matter
            description = fm.get('description', '')
            if not description:
                description = extract_description(body)
            
            # Normalize tags to array
            tags = fm['tags']
            if isinstance(tags, str):
                tags = [t.strip() for t in tags.split(',')]
            elif not isinstance(tags, list):
                tags = [str(tags)]
            
            # Build skills string for data-skills attribute (lowercase, comma-separated)
            skills = ','.join([t.lower().strip() for t in tags])
            
            # Normalize level to lowercase for consistency
            level = fm['level'].lower().strip()
            # Map common variants to standard values
            level_map = {
                'beginner': 'junior',
                'junior': 'junior',
                'mid': 'mid',
                'middle': 'mid',
                'advanced': 'advanced',
                'expert': 'advanced'
            }
            level = level_map.get(level, level)
            
            # Get order field (lower number = higher priority, default 999)
            order = fm.get('order', 999)
            try:
                order = int(order)
            except (ValueError, TypeError):
                order = 999
            
            project = {
                'id': project_dir.name,
                'title': fm['title'],
                'level': level,
                'tags': tags,
                'skills': skills,
                'cover': fm['cover'],
                'description': description,
                'order': order,
                'repo': fm.get('repo', ''),
                'demo': fm.get('demo', ''),
                'pdf': fm.get('pdf', '')
            }
            
            projects.append(project)
            print(f"Loaded: {project_dir.name} - {fm['title']}")
            
        except Exception as e:
            print(f"Error processing {project_dir.name}: {e}")
            continue
    
    return projects

def main():
    projects = scan_projects()
    
    # Sort projects by order field (lower number first), then by title
    projects.sort(key=lambda p: (p.get('order', 999), p['title']))
    
    manifest = {
        'generated': True,
        'count': len(projects),
        'projects': projects
    }
    
    output_file = PROJECTS_DIR / 'manifest.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    
    print(f"\nGenerated {output_file} with {len(projects)} projects")

if __name__ == '__main__':
    main()

