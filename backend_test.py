import requests
import sys
import json
from datetime import datetime

class RevolutionRPAPITester:
    def __init__(self, base_url="https://dc72c7d2-1843-4123-8f8a-c0ac573233bd.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_form_id = None
        self.created_submission_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_server_stats(self):
        """Test FiveM server stats endpoint"""
        success, response = self.run_test(
            "Server Stats",
            "GET",
            "server-stats",
            200
        )
        if success:
            required_fields = ['players', 'max_players', 'hostname', 'gametype']
            for field in required_fields:
                if field not in response:
                    print(f"⚠️  Warning: Missing field '{field}' in server stats")
                else:
                    print(f"   {field}: {response[field]}")
        return success

    def test_admin_login(self, username="admin", password="admin123"):
        """Test admin login and get token"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data={"username": username, "password": password}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        success, _ = self.run_test(
            "Admin Login (Invalid)",
            "POST",
            "admin/login",
            401,
            data={"username": "invalid", "password": "invalid"}
        )
        return success

    def test_admin_me(self):
        """Test getting current admin info"""
        success, response = self.run_test(
            "Admin Me",
            "GET",
            "admin/me",
            200,
            auth_required=True
        )
        if success:
            print(f"   Admin username: {response.get('username')}")
        return success

    def test_create_application_form(self):
        """Test creating a new application form"""
        form_data = {
            "title": "Staff Ansøgning",
            "description": "Ansøg som moderator på Revolution RP",
            "position": "Moderator",
            "webhook_url": "https://discord.com/api/webhooks/test123",
            "fields": [
                {
                    "label": "Dit navn",
                    "field_type": "text",
                    "required": True,
                    "placeholder": "Indtast dit fulde navn"
                },
                {
                    "label": "Hvorfor vil du være moderator?",
                    "field_type": "textarea",
                    "required": True
                },
                {
                    "label": "Erfaring",
                    "field_type": "select",
                    "required": True,
                    "options": ["Ingen", "Lidt", "Meget"]
                }
            ]
        }
        
        success, response = self.run_test(
            "Create Application Form",
            "POST",
            "admin/application-forms",
            200,
            data=form_data,
            auth_required=True
        )
        if success and 'id' in response:
            self.created_form_id = response['id']
            print(f"   Created form ID: {self.created_form_id}")
        return success

    def test_get_admin_application_forms(self):
        """Test getting all admin application forms"""
        success, response = self.run_test(
            "Get Admin Application Forms",
            "GET",
            "admin/application-forms",
            200,
            auth_required=True
        )
        if success:
            print(f"   Found {len(response)} application forms")
        return success

    def test_get_public_applications(self):
        """Test getting public applications"""
        success, response = self.run_test(
            "Get Public Applications",
            "GET",
            "applications",
            200
        )
        if success:
            print(f"   Found {len(response)} public applications")
        return success

    def test_get_specific_application(self):
        """Test getting a specific application form"""
        if not self.created_form_id:
            print("⚠️  Skipping - No form ID available")
            return False
            
        success, response = self.run_test(
            "Get Specific Application",
            "GET",
            f"applications/{self.created_form_id}",
            200
        )
        if success:
            print(f"   Form title: {response.get('title')}")
            print(f"   Form fields: {len(response.get('fields', []))}")
        return success

    def test_submit_application(self):
        """Test submitting an application"""
        if not self.created_form_id:
            print("⚠️  Skipping - No form ID available")
            return False

        # First get the form to get field IDs
        form_response = requests.get(f"{self.base_url}/applications/{self.created_form_id}")
        if form_response.status_code != 200:
            print("⚠️  Could not fetch form for submission test")
            return False
            
        form_data = form_response.json()
        
        # Create responses for each field
        responses = {}
        for field in form_data.get('fields', []):
            field_id = field['id']
            if field['field_type'] == 'text':
                responses[field_id] = "Test Ansøger"
            elif field['field_type'] == 'textarea':
                responses[field_id] = "Jeg vil gerne være moderator fordi jeg elsker at hjælpe andre spillere."
            elif field['field_type'] == 'select':
                responses[field_id] = field['options'][0] if field.get('options') else "Ingen"

        submission_data = {
            "form_id": self.created_form_id,
            "applicant_name": "Test Ansøger",
            "responses": responses
        }
        
        success, response = self.run_test(
            "Submit Application",
            "POST",
            "applications/submit",
            200,
            data=submission_data
        )
        if success and 'submission_id' in response:
            self.created_submission_id = response['submission_id']
            print(f"   Created submission ID: {self.created_submission_id}")
        return success

    def test_get_admin_submissions(self):
        """Test getting all admin submissions"""
        success, response = self.run_test(
            "Get Admin Submissions",
            "GET",
            "admin/submissions",
            200,
            auth_required=True
        )
        if success:
            print(f"   Found {len(response)} submissions")
        return success

    def test_update_submission_status(self):
        """Test updating submission status"""
        if not self.created_submission_id:
            print("⚠️  Skipping - No submission ID available")
            return False
            
        success, response = self.run_test(
            "Update Submission Status",
            "PUT",
            f"admin/submissions/{self.created_submission_id}/status",
            200,
            data={"status": "approved"},
            auth_required=True
        )
        return success

    def test_create_new_admin(self):
        """Test creating a new admin user"""
        admin_data = {
            "username": "testadmin",
            "password": "testpass123"
        }
        
        success, response = self.run_test(
            "Create New Admin",
            "POST",
            "admin/create-admin",
            200,
            data=admin_data,
            auth_required=True
        )
        return success

    def test_new_admin_login(self):
        """Test login with newly created admin"""
        success, response = self.run_test(
            "New Admin Login",
            "POST",
            "admin/login",
            200,
            data={"username": "testadmin", "password": "testpass123"}
        )
        return success

def main():
    print("🚀 Starting Revolution RP API Tests")
    print("=" * 50)
    
    tester = RevolutionRPAPITester()
    
    # Test sequence
    tests = [
        ("Server Stats", tester.test_server_stats),
        ("Admin Login", tester.test_admin_login),
        ("Admin Login Invalid", tester.test_admin_login_invalid),
        ("Admin Me", tester.test_admin_me),
        ("Create Application Form", tester.test_create_application_form),
        ("Get Admin Application Forms", tester.test_get_admin_application_forms),
        ("Get Public Applications", tester.test_get_public_applications),
        ("Get Specific Application", tester.test_get_specific_application),
        ("Submit Application", tester.test_submit_application),
        ("Get Admin Submissions", tester.test_get_admin_submissions),
        ("Update Submission Status", tester.test_update_submission_status),
        ("Create New Admin", tester.test_create_new_admin),
        ("New Admin Login", tester.test_new_admin_login),
    ]
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())