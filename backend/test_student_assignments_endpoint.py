"""
Quick test script for new GET /api/v1/student/assignments endpoint.
Run this after starting the backend server.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

# You need to replace this with a valid student JWT token
# Get it by logging in as a student user
STUDENT_TOKEN = "your-student-jwt-token-here"

headers = {
    "Authorization": f"Bearer {STUDENT_TOKEN}",
    "Content-Type": "application/json"
}


def test_get_assignments():
    """Test GET /api/v1/student/assignments"""
    print("\n=== Test: Get Student Assignments ===")
    response = requests.get(
        f"{BASE_URL}/api/v1/student/assignments",
        headers=headers
    )
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total assignments: {data['total']}")
        print(f"\nResponse: {json.dumps(data, indent=2)}")
        
        # Show details of each assignment
        if data['data']:
            print("\n=== Assignment Details ===")
            for idx, assignment in enumerate(data['data'], 1):
                print(f"\n{idx}. {assignment['title']}")
                print(f"   ID: {assignment['assignment_id']}")
                print(f"   Description: {assignment['description'][:50]}...")
                print(f"   Class Target: {assignment.get('class_target', 'N/A')}")
                print(f"   Teacher: {assignment.get('teacher_name', 'N/A')}")
                print(f"   Active: {assignment['is_active']}")
                print(f"   Created: {assignment['created_at']}")
                
                if assignment.get('rubric'):
                    rubric = assignment['rubric']
                    print(f"   Rubric:")
                    print(f"     - Grammar: {rubric['grammar_weight']}")
                    print(f"     - Mechanics: {rubric['mechanics_weight']}")
                    print(f"     - Content: {rubric['content_weight']}")
                    print(f"     - Unity: {rubric['unity_weight']}")
                else:
                    print(f"   Rubric: Not set")
        else:
            print("\nNo assignments found for this student.")
    else:
        print(f"Error Response: {json.dumps(response.json(), indent=2)}")


def test_get_assignments_unauthorized():
    """Test GET /api/v1/student/assignments without token"""
    print("\n=== Test: Get Assignments Without Token (should fail) ===")
    response = requests.get(
        f"{BASE_URL}/api/v1/student/assignments"
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


if __name__ == "__main__":
    print("=" * 60)
    print("Student Assignments Endpoint Test")
    print("=" * 60)
    print("\nIMPORTANT: Update STUDENT_TOKEN variable with valid student JWT")
    print("Get token by logging in as student user first\n")
    
    if STUDENT_TOKEN == "your-student-jwt-token-here":
        print("ERROR: Please update STUDENT_TOKEN in the script first!")
        exit(1)
    
    try:
        # Test 1: Get assignments with valid token
        test_get_assignments()
        
        # Test 2: Try without token (should fail with 401)
        test_get_assignments_unauthorized()
        
        print("\n" + "=" * 60)
        print("All tests completed!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("\nERROR: Cannot connect to backend server.")
        print("Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"\nERROR: {e}")
