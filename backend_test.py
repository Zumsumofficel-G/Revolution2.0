import requests
import sys
import json
from datetime import datetime

class RevolutionRPAPITester:
    def __init__(self, base_url="https://dc72c7d2-1843-4123-8f8a-c0ac573233bd.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.staff_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_form_id = None
        self.created_submission_id = None
        self.created_staff_username = f"teststaff_{datetime.now().strftime('%H%M%S')}"

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

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
            self.admin_token = response['access_token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            print(f"   Role: {response.get('role', 'unknown')}")
            return True
        return False

    def test_admin_user_me(self):
        """Test admin user/me endpoint"""
        if not self.admin_token:
            print("⚠️  Skipping - No admin token available")
            return False
            
        success, response = self.run_test(
            "Admin User Me",
            "GET",
            "user/me",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Type: {response.get('type')}")
            print(f"   Username: {response.get('username')}")
            print(f"   Role: {response.get('role')}")
            print(f"   Is Admin: {response.get('is_admin')}")
            print(f"   Is Staff: {response.get('is_staff')}")
        return success

    def test_create_staff_user(self):
        """Test creating a staff user (admin only)"""
        if not self.admin_token:
            print("⚠️  Skipping - No admin token available")
            return False

        staff_data = {
            "username": self.created_staff_username,
            "password": "staffpass123",
            "role": "staff"
        }
        
        success, response = self.run_test(
            "Create Staff User",
            "POST",
            "admin/create-user",
            200,
            data=staff_data,
            token=self.admin_token
        )
        return success

    def test_staff_login(self):
        """Test staff user login"""
        success, response = self.run_test(
            "Staff Login",
            "POST",
            "admin/login",
            200,
            data={"username": self.created_staff_username, "password": "staffpass123"}
        )
        if success and 'access_token' in response:
            self.staff_token = response['access_token']
            print(f"   Staff token obtained: {self.staff_token[:20]}...")
            print(f"   Role: {response.get('role', 'unknown')}")
            return True
        return False

    def test_staff_user_me(self):
        """Test staff user/me endpoint"""
        if not self.staff_token:
            print("⚠️  Skipping - No staff token available")
            return False
            
        success, response = self.run_test(
            "Staff User Me",
            "GET",
            "user/me",
            200,
            token=self.staff_token
        )
        if success:
            print(f"   Type: {response.get('type')}")
            print(f"   Username: {response.get('username')}")
            print(f"   Role: {response.get('role')}")
            print(f"   Is Admin: {response.get('is_admin')}")
            print(f"   Is Staff: {response.get('is_staff')}")
        return success

    def test_get_admin_users(self):
        """Test getting all admin users (admin only)"""
        if not self.admin_token:
            print("⚠️  Skipping - No admin token available")
            return False
            
        success, response = self.run_test(
            "Get Admin Users",
            "GET",
            "admin/users",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Found {len(response)} users")
            for user in response:
                print(f"   - {user.get('username')} ({user.get('role')})")
        return success

    def test_staff_cannot_get_users(self):
        """Test that staff cannot access admin users endpoint"""
        if not self.staff_token:
            print("⚠️  Skipping - No staff token available")
            return False
            
        success, response = self.run_test(
            "Staff Cannot Get Users",
            "GET",
            "admin/users",
            403,  # Should be forbidden
            token=self.staff_token
        )
        return success

    def test_admin_create_application_form(self):
        """Test admin creating application form"""
        if not self.admin_token:
            print("⚠️  Skipping - No admin token available")
            return False

        form_data = {
            "title": "Staff Ansøgning Test",
            "description": "Test ansøgning for staff rolle",
            "position": "Staff",
            "webhook_url": "https://discord.com/api/webhooks/test123",
            "fields": [
                {
                    "label": "Dit navn",
                    "field_type": "text",
                    "required": True,
                    "placeholder": "Indtast dit fulde navn"
                },
                {
                    "label": "Hvorfor vil du være staff?",
                    "field_type": "textarea",
                    "required": True
                }
            ]
        }
        
        success, response = self.run_test(
            "Admin Create Application Form",
            "POST",
            "admin/application-forms",
            200,
            data=form_data,
            token=self.admin_token
        )
        if success and 'id' in response:
            self.created_form_id = response['id']
            print(f"   Created form ID: {self.created_form_id}")
        return success

    def test_staff_cannot_create_form(self):
        """Test that staff cannot create application forms"""
        if not self.staff_token:
            print("⚠️  Skipping - No staff token available")
            return False

        form_data = {
            "title": "Staff Should Not Create This",
            "description": "This should fail",
            "position": "Test",
            "fields": []
        }
        
        success, response = self.run_test(
            "Staff Cannot Create Form",
            "POST",
            "admin/application-forms",
            403,  # Should be forbidden
            data=form_data,
            token=self.staff_token
        )
        return success

    def test_admin_get_application_forms(self):
        """Test admin getting application forms"""
        if not self.admin_token:
            print("⚠️  Skipping - No admin token available")
            return False
            
        success, response = self.run_test(
            "Admin Get Application Forms",
            "GET",
            "admin/application-forms",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Found {len(response)} application forms")
        return success

    def test_staff_cannot_get_forms(self):
        """Test that staff cannot access application forms endpoint"""
        if not self.staff_token:
            print("⚠️  Skipping - No staff token available")
            return False
            
        success, response = self.run_test(
            "Staff Cannot Get Forms",
            "GET",
            "admin/application-forms",
            403,  # Should be forbidden
            token=self.staff_token
        )
        return success

    def test_public_submit_application(self):
        """Test public application submission"""
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
                responses[field_id] = "Jeg vil gerne være staff fordi jeg elsker at hjælpe andre spillere."

        submission_data = {
            "form_id": self.created_form_id,
            "applicant_name": "Test Ansøger",
            "responses": responses
        }
        
        success, response = self.run_test(
            "Public Submit Application",
            "POST",
            "applications/submit",
            200,
            data=submission_data
        )
        if success and 'submission_id' in response:
            self.created_submission_id = response['submission_id']
            print(f"   Created submission ID: {self.created_submission_id}")
        return success

    def test_admin_get_submissions(self):
        """Test admin getting submissions"""
        if not self.admin_token:
            print("⚠️  Skipping - No admin token available")
            return False
            
        success, response = self.run_test(
            "Admin Get Submissions",
            "GET",
            "admin/submissions",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Found {len(response)} submissions")
        return success

    def test_staff_get_submissions(self):
        """Test staff getting submissions (should work)"""
        if not self.staff_token:
            print("⚠️  Skipping - No staff token available")
            return False
            
        success, response = self.run_test(
            "Staff Get Submissions",
            "GET",
            "admin/submissions",
            200,
            token=self.staff_token
        )
        if success:
            print(f"   Found {len(response)} submissions")
        return success

    def test_admin_update_submission_status(self):
        """Test admin updating submission status"""
        if not self.admin_token or not self.created_submission_id:
            print("⚠️  Skipping - No admin token or submission ID available")
            return False
            
        success, response = self.run_test(
            "Admin Update Submission Status",
            "PUT",
            f"admin/submissions/{self.created_submission_id}/status",
            200,
            data={"status": "approved"},
            token=self.admin_token
        )
        return success

    def test_staff_update_submission_status(self):
        """Test staff updating submission status (should work)"""
        if not self.staff_token or not self.created_submission_id:
            print("⚠️  Skipping - No staff token or submission ID available")
            return False
            
        success, response = self.run_test(
            "Staff Update Submission Status",
            "PUT",
            f"admin/submissions/{self.created_submission_id}/status",
            200,
            data={"status": "rejected"},
            token=self.staff_token
        )
        return success

    def test_get_public_applications(self):
        """Test getting public applications (no auth required)"""
        success, response = self.run_test(
            "Get Public Applications",
            "GET",
            "applications",
            200
        )
        if success:
            print(f"   Found {len(response)} public applications")
        return success

def main():
    print("🚀 Starting Revolution RP Role-Based User System Tests")
    print("=" * 70)
    
    tester = RevolutionRPAPITester()
    
    # Test sequence - organized by role-based functionality
    tests = [
        # Basic functionality tests
        ("Server Stats", tester.test_server_stats),
        ("Get Public Applications", tester.test_get_public_applications),
        
        # Admin authentication and user management
        ("Admin Login", tester.test_admin_login),
        ("Admin User Me", tester.test_admin_user_me),
        ("Create Staff User", tester.test_create_staff_user),
        ("Get Admin Users", tester.test_get_admin_users),
        
        # Staff authentication
        ("Staff Login", tester.test_staff_login),
        ("Staff User Me", tester.test_staff_user_me),
        
        # Role-based access control tests
        ("Staff Cannot Get Users", tester.test_staff_cannot_get_users),
        ("Admin Create Application Form", tester.test_admin_create_application_form),
        ("Staff Cannot Create Form", tester.test_staff_cannot_create_form),
        ("Admin Get Application Forms", tester.test_admin_get_application_forms),
        ("Staff Cannot Get Forms", tester.test_staff_cannot_get_forms),
        
        # Application submission and management
        ("Public Submit Application", tester.test_public_submit_application),
        ("Admin Get Submissions", tester.test_admin_get_submissions),
        ("Staff Get Submissions", tester.test_staff_get_submissions),
        ("Admin Update Submission Status", tester.test_admin_update_submission_status),
        ("Staff Update Submission Status", tester.test_staff_update_submission_status),
    ]
    
    print(f"\n📋 Running {len(tests)} tests...")
    print("-" * 70)
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 70)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        print("\n✅ Role-Based System Features Working:")
        print("   - Admin can create staff users")
        print("   - Admin has full access to all endpoints")
        print("   - Staff can manage submissions but not create forms")
        print("   - Role-based access control properly enforced")
        print("   - Public application submission works without login")
        return 0
    else:
        failed_tests = tester.tests_run - tester.tests_passed
        print(f"⚠️  {failed_tests} tests failed")
        print("\n🔍 Issues found:")
        if failed_tests > 8:
            print("   - Multiple critical failures detected")
            print("   - Role-based system may need significant fixes")
        else:
            print("   - Minor issues detected")
            print("   - Role-based system mostly functional")
        return 1

if __name__ == "__main__":
    sys.exit(main())