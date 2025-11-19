#!/usr/bin/env python3
"""
Quick verification script to test deployment readiness
Run this before deploying to Azure to catch any issues
"""

import os
import sys

def check_file_exists(filepath, description):
    """Check if a required file exists"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description}: MISSING - {filepath}")
        return False

def check_environment():
    """Check environment configuration"""
    print("\n" + "="*60)
    print("DEPLOYMENT READINESS CHECK")
    print("="*60 + "\n")

    all_good = True

    # Check Dockerfiles
    print("📦 Docker Configuration:")
    all_good &= check_file_exists("Dockerfile.backend", "Backend Dockerfile")
    all_good &= check_file_exists("Dockerfile.frontend", "Frontend Dockerfile")
    all_good &= check_file_exists("docker-compose.yml", "Docker Compose")

    # Check deployment scripts
    print("\n🚀 Deployment Scripts:")
    all_good &= check_file_exists("update-azure.ps1", "Azure Update Script")
    all_good &= check_file_exists("deploy-azure-clean.ps1", "Azure Deploy Script")

    # Check source files
    print("\n📁 Source Files:")
    all_good &= check_file_exists("python-nlp/app.py", "Backend App")
    all_good &= check_file_exists("python-nlp/requirements.txt", "Python Requirements")
    all_good &= check_file_exists("src/config/constants.js", "Frontend Constants")
    all_good &= check_file_exists("package.json", "Package.json")

    # Check key components
    print("\n🎯 Key Components:")
    all_good &= check_file_exists("src/components/EmailEditor.js", "Email Editor")
    all_good &= check_file_exists("src/components/OnlyOfficeViewer.js", "OnlyOffice Viewer")
    all_good &= check_file_exists("src/components/VariablePanel.js", "Variable Panel")
    all_good &= check_file_exists("src/components/compliance/complianceRules.js", "Compliance Rules")

    # Check services
    print("\n🔧 Services:")
    all_good &= check_file_exists("python-nlp/docx_service.py", "DOCX Service")
    all_good &= check_file_exists("python-nlp/gliner_service.py", "GLiNER Service")
    all_good &= check_file_exists("python-nlp/nlp_service.py", "NLP Service")

    # Check configuration files
    print("\n⚙️ Configuration:")
    constants_path = "src/config/constants.js"
    if os.path.exists(constants_path):
        with open(constants_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'azurecontainerapps.io' in content:
                print("✅ Frontend configured for Azure Container Apps")
            else:
                print("⚠️  Frontend may need Azure configuration check")
                all_good = False
    
    app_path = "python-nlp/app.py"
    if os.path.exists(app_path):
        with open(app_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'get_onlyoffice_url' in content:
                print("✅ Backend configured for dynamic OnlyOffice URL")
            else:
                print("⚠️  Backend may need OnlyOffice URL configuration")
                all_good = False
            
            if 'ALLOWED_ORIGINS' in content:
                print("✅ Backend CORS configured")
            else:
                print("❌ Backend CORS not configured")
                all_good = False

    # Check default document
    print("\n📄 Default Document:")
    all_good &= check_file_exists("public/Main Offer Letter.docx", "Default Offer Letter")

    # Summary
    print("\n" + "="*60)
    if all_good:
        print("✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT!")
        print("\nRun: .\\update-azure.ps1 to deploy")
    else:
        print("❌ SOME CHECKS FAILED - PLEASE FIX ISSUES ABOVE")
        return 1
    print("="*60 + "\n")

    # Azure info
    print("\n🌐 Azure Deployment Info:")
    print("Resource Group: Techgene_group")
    print("Container Registry: emailautomation22833")
    print("Frontend: https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io")
    print("Backend:  https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io")
    print("OnlyOffice: https://onlyoffice.reddesert-f6724e64.centralus.azurecontainerapps.io")

    return 0

if __name__ == "__main__":
    try:
        sys.exit(check_environment())
    except Exception as e:
        print(f"\n❌ Error during check: {e}")
        sys.exit(1)
