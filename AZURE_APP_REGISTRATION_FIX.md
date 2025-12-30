# Fix: Azure App Registration Redirect URI Error

## ❌ **Error You're Seeing:**

```
AADSTS50011: The redirect URI 'https://login.microsoftonline.com/common/oauth2/nativeclient' 
specified in the request does not match the redirect URIs configured for the application 
'2b74ef92-7feb-45c7-94c2-62978353fc66'.
```

## 🎯 **Quick Solutions (Choose ONE)**

---

## ✅ **Solution 1: Use Device Code Flow (RECOMMENDED - Works Now!)**

**No Azure changes needed!** Use this script instead:

```powershell
E:\Email-automation-MVP\microsoft-login-devicecode.ps1
```

**How it works:**
1. Script shows you a code (e.g., `ABC123DEF`)
2. Opens browser to https://microsoft.com/devicelogin
3. You enter the code
4. Login with Microsoft account
5. Done! No redirect URI needed!

**Advantages:**
- ✅ Works immediately without Azure changes
- ✅ No IT approval needed
- ✅ More secure (code-based auth)
- ✅ Works on any computer

---

## ✅ **Solution 2: Add Redirect URIs to Azure (Permanent Fix)**

Ask your IT admin to add these redirect URIs to the Azure App Registration:

### **Step-by-Step for IT Admin:**

#### **Option A: Via Azure Portal**

1. Go to: https://portal.azure.com
2. Navigate to: **Azure Active Directory** → **App registrations**
3. Search for app ID: `2b74ef92-7feb-45c7-94c2-62978353fc66`
4. Click on the app
5. Click **Authentication** in the left menu

**Add Mobile and Desktop Redirect URI:**
6. Click **+ Add a platform** → **Mobile and desktop applications**
7. Check the boxes for:
   - ✅ `https://login.microsoftonline.com/common/oauth2/nativeclient`
   - ✅ `http://localhost`
   - ✅ `http://localhost:8400`
8. Click **Configure**

**Add Web Redirect URIs (if needed):**
9. Under **Web** section, click **+ Add URI**
10. Add these URIs:
    - `https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io/auth/callback`
    - `http://localhost:3000/auth/callback` (for local testing)
11. Click **Save**

**Enable Public Client Flow:**
12. Scroll down to **Advanced settings**
13. Set **Allow public client flows** to **Yes**
14. Click **Save**

#### **Option B: Via Azure CLI**

```bash
# Add native client redirect URI
az ad app update --id 2b74ef92-7feb-45c7-94c2-62978353fc66 \
  --public-client-redirect-uris \
    "https://login.microsoftonline.com/common/oauth2/nativeclient" \
    "http://localhost" \
    "http://localhost:8400"

# Enable public client flows
az ad app update --id 2b74ef92-7feb-45c7-94c2-62978353fc66 \
  --set publicClient.redirectUris='["https://login.microsoftonline.com/common/oauth2/nativeclient","http://localhost","http://localhost:8400"]'
```

#### **Option C: Via PowerShell**

```powershell
# Connect to Azure AD
Connect-AzureAD

# Get the app
$app = Get-AzureADApplication -Filter "AppId eq '2b74ef92-7feb-45c7-94c2-62978353fc66'"

# Add redirect URIs
$redirectUris = @(
    "https://login.microsoftonline.com/common/oauth2/nativeclient",
    "http://localhost",
    "http://localhost:8400",
    "https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io/auth/callback"
)

Set-AzureADApplication -ObjectId $app.ObjectId -ReplyUrls $redirectUris

# Enable public client
Set-AzureADApplication -ObjectId $app.ObjectId -PublicClient $true
```

---

## 🔧 **Solution 3: Use Localhost Redirect**

Add just `http://localhost:8400` to Azure, then use this script:

```powershell
E:\Email-automation-MVP\microsoft-login-fixed.ps1
```

This tries localhost redirect first, falls back to device code if that fails.

---

## 📋 **Which Script to Use?**

| Script | Requires Azure Changes | How It Works | Best For |
|--------|----------------------|--------------|----------|
| `microsoft-login-devicecode.ps1` | ❌ No | Device code flow | **Use this now!** |
| `microsoft-login-fixed.ps1` | ⚠️ Minimal | Localhost + fallback | After IT adds localhost URI |
| `microsoft-login.ps1` | ✅ Yes | Interactive popup | After IT adds all URIs |

---

## 🎯 **For Your Colleague - Run This NOW:**

```powershell
# This works without any Azure changes!
E:\Email-automation-MVP\microsoft-login-devicecode.ps1
```

**What happens:**
1. Shows: "To sign in, use a web browser to open https://microsoft.com/devicelogin and enter the code ABC123DEF"
2. You open browser, go to that URL
3. Enter the code shown
4. Login with your Techgene Microsoft account
5. Done! API key generated!

---

## 📧 **Email Template for IT**

```
Subject: Azure App Registration - Add Redirect URIs

Hi IT Team,

We need to add redirect URIs to our Azure App Registration for the Email Automation API.

App ID: 2b74ef92-7feb-45c7-94c2-62978353fc66
Tenant ID: b3235290-db90-4365-b033-ae68284de5bd

Required Changes:
1. Add Mobile/Desktop redirect URIs:
   - https://login.microsoftonline.com/common/oauth2/nativeclient
   - http://localhost
   - http://localhost:8400

2. Enable "Allow public client flows": Yes

This will allow team members to login via PowerShell scripts for API automation.

Azure Portal Path:
Azure AD → App registrations → [App] → Authentication → Add platform → Mobile and desktop applications

Let me know when complete!

Thanks,
[Your Name]
```

---

## ⚠️ **Temporary Workaround (While Waiting for IT)**

Use **Device Code Flow** - it bypasses the redirect URI requirement entirely!

```powershell
# Install MSAL if needed
Install-Module -Name MSAL.PS -Scope CurrentUser -Force

# Run device code flow script
E:\Email-automation-MVP\microsoft-login-devicecode.ps1
```

---

## ✅ **Verification After IT Makes Changes**

Test that redirect URIs are configured correctly:

```powershell
# This should work after IT adds URIs
E:\Email-automation-MVP\microsoft-login.ps1
```

If it works without errors → ✅ Azure is configured correctly!

---

## 📚 **Additional Resources**

- [Azure AD Redirect URI documentation](https://aka.ms/redirectUriMismatchError)
- [Device Code Flow documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-device-code)
- [MSAL.PS documentation](https://github.com/AzureAD/MSAL.PS)

---

## 🎉 **Summary**

**Right Now:** Use `microsoft-login-devicecode.ps1` (works without Azure changes)

**After IT Approval:** Use `microsoft-login.ps1` (cleaner, browser popup)

**Both work perfectly and generate the same API keys!**
