#!/usr/bin/env python3
"""
update_to_github.py
Automatically build manifests and push to GitHub.

Usage:
    python update_to_github.py -c "commit message"
    python update_to_github.py --commit "commit message"
"""

import subprocess
import sys
import argparse
from pathlib import Path

ROOT = Path(__file__).parent

def run_command(cmd, check=True):
    """Run a shell command and return the result"""
    print(f"\n{'='*60}")
    print(f"Running: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    print('='*60)
    
    try:
        if isinstance(cmd, str):
            result = subprocess.run(cmd, shell=True, check=check, 
                                  capture_output=False, text=True)
        else:
            result = subprocess.run(cmd, check=check, 
                                  capture_output=False, text=True)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"Error: Command failed with exit code {e.returncode}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description='Build manifests and push to GitHub',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python update_to_github.py -c "Add new project"
  python update_to_github.py --commit "Update posts"
        """
    )
    parser.add_argument('-c', '--commit', 
                       required=True,
                       help='Commit message')
    
    args = parser.parse_args()
    commit_message = args.commit
    
    if not commit_message or not commit_message.strip():
        print("Error: Commit message cannot be empty")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("Starting update process...")
    print("="*60)
    
    # Step 1: Build projects manifest
    print("\n[1/5] Building projects manifest...")
    if not run_command([sys.executable, str(ROOT / 'build_projects_manifest.py')]):
        print("Error: Failed to build projects manifest")
        sys.exit(1)
    
    # Step 2: Build posts manifest
    print("\n[2/5] Building posts manifest...")
    if not run_command([sys.executable, str(ROOT / 'build_posts_manifest.py')]):
        print("Error: Failed to build posts manifest")
        sys.exit(1)
    
    # Step 3: Git add all changes
    print("\n[3/5] Staging changes...")
    if not run_command(['git', 'add', '-A']):
        print("Error: Failed to stage changes")
        sys.exit(1)
    
    # Step 4: Git commit (allow failure if no changes)
    print("\n[4/5] Committing changes...")
    commit_success = run_command(['git', 'commit', '-m', commit_message], check=False)
    if not commit_success:
        # Check if there are actually changes to commit
        result = subprocess.run(['git', 'diff', '--cached', '--quiet'], 
                              capture_output=True)
        if result.returncode == 0:
            print("Note: No changes to commit (everything is up to date)")
        else:
            print("Warning: Commit failed, but continuing...")
    
    # Step 5: Git push
    print("\n[5/5] Pushing to GitHub...")
    push_success = run_command(['git', 'push'], check=False)
    
    if not push_success:
        # Check if it's because upstream is not set
        result = subprocess.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], 
                              capture_output=True, text=True)
        current_branch = result.stdout.strip() if result.returncode == 0 else 'main'
        
        print(f"\nUpstream branch not set. Setting upstream to origin/{current_branch}...")
        if run_command(['git', 'push', '--set-upstream', 'origin', current_branch]):
            print("✓ Successfully set upstream and pushed!")
        else:
            print("Error: Failed to push to GitHub")
            print("\nTroubleshooting:")
            print("1. Check if remote 'origin' is set: git remote -v")
            print("2. If not, set it: git remote add origin <your-repo-url>")
            sys.exit(1)
    
    print("\n" + "="*60)
    print("✓ Successfully updated to GitHub!")
    print("="*60)
    print(f"\nCommit message: {commit_message}")
    print("\nGitHub Actions will automatically build and deploy your site.")
    print("Check your repository's Actions tab for deployment status.")

if __name__ == '__main__':
    main()

