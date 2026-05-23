"""
Quick test script for new school management endpoints.
Run this after starting the backend server.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

# You need to replace this with a valid admin JWT token
# Get it by logging in as admin user
ADMIN_TOKEN = "your-admin-jwt-token-here"

headers = {
    "Authorization": f"Bearer {ADMIN_TOKEN}",
    "Content-Type": "application/json"
}


def test_list_schools():
    """Test GET /api/v1/admin/schools"""
    print("\n=== Test 1: List Schools ===")
    response = requests.get(f"{BASE_URL}/api/v1/admin/schools", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.json()


def test_create_school():
    """Test POST /api/v1/admin/schools"""
    print("\n=== Test 2: Create School ===")
    data = {"name": "SMPN 1 Kupang"}
    response = requests.post(
        f"{BASE_URL}/api/v1/admin/schools",
        headers=headers,
        json=data
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.json()


def test_create_duplicate_school():
    """Test POST /api/v1/admin/schools with duplicate name"""
    print("\n=== Test 3: Create Duplicate School (should fail) ===")
    data = {"name": "SMPN 1 Kupang"}
    response = requests.post(
        f"{BASE_URL}/api/v1/admin/schools",
        headers=headers,
        json=data
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_update_school(school_id: str):
    """Test PATCH /api/v1/admin/schools/{school_id}"""
    print("\n=== Test 4: Update School ===")
    data = {"name": "SMPN 2 Kupang"}
    response = requests.patch(
        f"{BASE_URL}/api/v1/admin/schools/{school_id}",
        headers=headers,
        json=data
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_assign_user_to_school(user_id: str, school_id: str):
    """Test PATCH /api/v1/admin/users/{user_id}/school"""
    print("\n=== Test 5: Assign User to School ===")
    data = {"school_id": school_id}
    response = requests.patch(
        f"{BASE_URL}/api/v1/admin/users/{user_id}/school",
        headers=headers,
        json=data
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_list_users():
    """Test GET /api/v1/admin/users to get a user_id"""
    print("\n=== Getting User List ===")
    response = requests.get(
        f"{BASE_URL}/api/v1/admin/users?limit=5",
        headers=headers
    )
    print(f"Status: {response.status_code}")
    users = response.json().get("users", [])
    if users:
        print(f"Found {len(users)} users")
        return users[0]["id"]
    return None


if __name__ == "__main__":
    print("=" * 60)
    print("School Management Endpoints Test")
    print("=" * 60)
    print("\nIMPORTANT: Update ADMIN_TOKEN variable with valid admin JWT")
    print("Get token by logging in as admin user first\n")
    
    if ADMIN_TOKEN == "your-admin-jwt-token-here":
        print("ERROR: Please update ADMIN_TOKEN in the script first!")
        exit(1)
    
    try:
        # Test 1: List schools (should be empty initially)
        schools = test_list_schools()
        
        # Test 2: Create a school
        new_school = test_create_school()
        school_id = new_school.get("id")
        
        # Test 3: Try to create duplicate (should fail with 409)
        test_create_duplicate_school()
        
        # Test 4: Update school name
        if school_id:
            test_update_school(school_id)
        
        # Test 5: Assign user to school
        user_id = test_list_users()
        if user_id and school_id:
            test_assign_user_to_school(user_id, school_id)
        
        # Test 6: List schools again (should show updated data)
        test_list_schools()
        
        print("\n" + "=" * 60)
        print("All tests completed!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("\nERROR: Cannot connect to backend server.")
        print("Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"\nERROR: {e}")
