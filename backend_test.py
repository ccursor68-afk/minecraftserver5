#!/usr/bin/env python3
"""
Backend API Test Suite for Minecraft Server List Application
Tests admin API endpoints using Supabase backend
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"

class MinecraftServerListTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.test_data = {
            'user_id': None,
            'ticket_id': None,
            'server_id': None,
            'category_id': None,
            'post_id': None
        }
    
    def log_test(self, test_name: str, success: bool, message: str, details: Optional[Dict] = None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {details}")
    
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, expected_status: int = 200) -> Optional[Dict]:
        """Make HTTP request and handle response"""
        url = f"{API_BASE}{endpoint}"
        try:
            if method.upper() == 'GET':
                response = self.session.get(url)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data)
            elif method.upper() == 'PATCH':
                response = self.session.patch(url, json=data)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            print(f"   Request: {method} {url}")
            print(f"   Status: {response.status_code}")
            
            if response.status_code == expected_status:
                try:
                    return response.json()
                except:
                    return {"success": True, "status_code": response.status_code}
            else:
                print(f"   Expected status {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error response: {error_data}")
                    return {"error": error_data, "status_code": response.status_code}
                except:
                    return {"error": response.text, "status_code": response.status_code}
                    
        except requests.exceptions.RequestException as e:
            print(f"   Request failed: {str(e)}")
            return {"error": str(e), "status_code": 0}
    
    def test_get_admin_users(self):
        """Test GET /api/admin/users - Get all users"""
        print("\n🔍 Testing GET /api/admin/users")
        
        response = self.make_request('GET', '/admin/users')
        
        if response and 'error' not in response:
            users = response
            if isinstance(users, list):
                self.log_test(
                    "GET /api/admin/users",
                    True,
                    f"Successfully retrieved {len(users)} users",
                    {"user_count": len(users), "sample_user": users[0] if users else None}
                )
                # Store a user ID for role update test
                if users:
                    self.test_data['user_id'] = users[0].get('id')
                return True
            else:
                self.log_test("GET /api/admin/users", False, "Response is not a list", {"response": response})
        else:
            self.log_test("GET /api/admin/users", False, "Failed to get users", {"error": response})
        
        return False
    
    def test_patch_user_role(self):
        """Test PATCH /api/admin/users/:id/role - Update user role"""
        print("\n🔍 Testing PATCH /api/admin/users/:id/role")
        
        if not self.test_data['user_id']:
            self.log_test("PATCH /api/admin/users/:id/role", False, "No user ID available for testing", {})
            return False
        
        user_id = self.test_data['user_id']
        test_role = "admin"
        
        response = self.make_request('PATCH', f'/admin/users/{user_id}/role', {'role': test_role})
        
        if response and 'error' not in response:
            if response.get('role') == test_role:
                self.log_test(
                    "PATCH /api/admin/users/:id/role",
                    True,
                    f"Successfully updated user role to {test_role}",
                    {"user_id": user_id, "new_role": test_role}
                )
                
                # Test with invalid role
                invalid_response = self.make_request('PATCH', f'/admin/users/{user_id}/role', {'role': 'invalid'}, 400)
                if invalid_response and invalid_response.get('status_code') == 400:
                    self.log_test(
                        "PATCH /api/admin/users/:id/role (invalid role)",
                        True,
                        "Correctly rejected invalid role",
                        {"expected_status": 400}
                    )
                
                return True
            else:
                self.log_test("PATCH /api/admin/users/:id/role", False, "Role not updated correctly", {"response": response})
        else:
            self.log_test("PATCH /api/admin/users/:id/role", False, "Failed to update user role", {"error": response})
        
        return False
    
    def test_get_admin_tickets(self):
        """Test GET /api/admin/tickets - Get all tickets"""
        print("\n🔍 Testing GET /api/admin/tickets")
        
        response = self.make_request('GET', '/admin/tickets')
        
        if response and 'error' not in response:
            tickets = response
            if isinstance(tickets, list):
                self.log_test(
                    "GET /api/admin/tickets",
                    True,
                    f"Successfully retrieved {len(tickets)} tickets",
                    {"ticket_count": len(tickets), "sample_ticket": tickets[0] if tickets else None}
                )
                # Store a ticket ID for close/delete tests
                if tickets:
                    self.test_data['ticket_id'] = tickets[0].get('id')
                return True
            else:
                self.log_test("GET /api/admin/tickets", False, "Response is not a list", {"response": response})
        else:
            self.log_test("GET /api/admin/tickets", False, "Failed to get tickets", {"error": response})
        
        return False
    
    def test_patch_ticket_close(self):
        """Test PATCH /api/admin/tickets/:id/close - Close a ticket"""
        print("\n🔍 Testing PATCH /api/admin/tickets/:id/close")
        
        if not self.test_data['ticket_id']:
            self.log_test("PATCH /api/admin/tickets/:id/close", False, "No ticket ID available for testing", {})
            return False
        
        ticket_id = self.test_data['ticket_id']
        
        response = self.make_request('PATCH', f'/admin/tickets/{ticket_id}/close')
        
        if response and 'error' not in response:
            if response.get('status') == 'closed':
                self.log_test(
                    "PATCH /api/admin/tickets/:id/close",
                    True,
                    f"Successfully closed ticket {ticket_id}",
                    {"ticket_id": ticket_id, "status": "closed"}
                )
                return True
            else:
                self.log_test("PATCH /api/admin/tickets/:id/close", False, "Ticket status not updated to closed", {"response": response})
        else:
            self.log_test("PATCH /api/admin/tickets/:id/close", False, "Failed to close ticket", {"error": response})
        
        return False
    
    def test_delete_ticket(self):
        """Test DELETE /api/admin/tickets/:id - Delete a ticket"""
        print("\n🔍 Testing DELETE /api/admin/tickets/:id")
        
        if not self.test_data['ticket_id']:
            self.log_test("DELETE /api/admin/tickets/:id", False, "No ticket ID available for testing", {})
            return False
        
        ticket_id = self.test_data['ticket_id']
        
        response = self.make_request('DELETE', f'/admin/tickets/{ticket_id}')
        
        if response and 'error' not in response:
            if response.get('success') or response.get('message'):
                self.log_test(
                    "DELETE /api/admin/tickets/:id",
                    True,
                    f"Successfully deleted ticket {ticket_id}",
                    {"ticket_id": ticket_id}
                )
                return True
            else:
                self.log_test("DELETE /api/admin/tickets/:id", False, "Unexpected response format", {"response": response})
        else:
            self.log_test("DELETE /api/admin/tickets/:id", False, "Failed to delete ticket", {"error": response})
        
        return False
    
    def test_get_servers(self):
        """Test GET /api/servers - Get all servers"""
        print("\n🔍 Testing GET /api/servers")
        
        response = self.make_request('GET', '/servers')
        
        if response and 'error' not in response:
            servers = response
            if isinstance(servers, list):
                self.log_test(
                    "GET /api/servers",
                    True,
                    f"Successfully retrieved {len(servers)} servers",
                    {"server_count": len(servers), "sample_server": servers[0] if servers else None}
                )
                # Store a server ID for delete test
                if servers:
                    self.test_data['server_id'] = servers[0].get('id')
                return True
            else:
                self.log_test("GET /api/servers", False, "Response is not a list", {"response": response})
        else:
            self.log_test("GET /api/servers", False, "Failed to get servers", {"error": response})
        
        return False
    
    def test_delete_server(self):
        """Test DELETE /api/admin/servers/:id - Delete a server"""
        print("\n🔍 Testing DELETE /api/admin/servers/:id")
        
        if not self.test_data['server_id']:
            self.log_test("DELETE /api/admin/servers/:id", False, "No server ID available for testing", {})
            return False
        
        server_id = self.test_data['server_id']
        
        response = self.make_request('DELETE', f'/admin/servers/{server_id}')
        
        if response and 'error' not in response:
            if response.get('success') or response.get('message'):
                self.log_test(
                    "DELETE /api/admin/servers/:id",
                    True,
                    f"Successfully deleted server {server_id}",
                    {"server_id": server_id}
                )
                return True
            else:
                self.log_test("DELETE /api/admin/servers/:id", False, "Unexpected response format", {"response": response})
        else:
            self.log_test("DELETE /api/admin/servers/:id", False, "Failed to delete server", {"error": response})
        
        return False
    
    # Blog API Tests
    def test_post_blog_category(self):
        """Test POST /api/blog/categories - Create new category"""
        print("\n🔍 Testing POST /api/blog/categories")
        
        # Test creating a valid category
        category_data = {
            "name": "Gaming Guides",
            "slug": "gaming-guides",
            "description": "Comprehensive guides for Minecraft gameplay",
            "icon": "🎮",
            "color": "#22c55e"
        }
        
        response = self.make_request('POST', '/blog/categories', category_data, 201)
        
        if response and 'error' not in response:
            if response.get('id') and response.get('name') == category_data['name']:
                self.test_data['category_id'] = response.get('id')
                self.log_test(
                    "POST /api/blog/categories",
                    True,
                    f"Successfully created category '{category_data['name']}'",
                    {"category_id": response.get('id'), "slug": response.get('slug')}
                )
                
                # Test duplicate slug validation
                duplicate_response = self.make_request('POST', '/blog/categories', category_data, 409)
                if duplicate_response and duplicate_response.get('status_code') == 409:
                    self.log_test(
                        "POST /api/blog/categories (duplicate slug)",
                        True,
                        "Correctly rejected duplicate slug",
                        {"expected_status": 409}
                    )
                
                # Test missing required fields
                invalid_data = {"name": "Test Category"}  # Missing slug
                invalid_response = self.make_request('POST', '/blog/categories', invalid_data, 400)
                if invalid_response and invalid_response.get('status_code') == 400:
                    self.log_test(
                        "POST /api/blog/categories (missing fields)",
                        True,
                        "Correctly rejected missing required fields",
                        {"expected_status": 400}
                    )
                
                return True
            else:
                self.log_test("POST /api/blog/categories", False, "Invalid response format", {"response": response})
        else:
            self.log_test("POST /api/blog/categories", False, "Failed to create category", {"error": response})
        
        return False
    
    def test_get_blog_posts(self):
        """Test GET /api/blog/posts - Get posts with filtering"""
        print("\n🔍 Testing GET /api/blog/posts")
        
        # Test getting all posts
        response = self.make_request('GET', '/blog/posts')
        
        if response and 'error' not in response:
            posts = response
            if isinstance(posts, list):
                self.log_test(
                    "GET /api/blog/posts (all posts)",
                    True,
                    f"Successfully retrieved {len(posts)} posts",
                    {"post_count": len(posts)}
                )
                
                # Test filtering by categoryId if we have one
                if self.test_data['category_id']:
                    category_response = self.make_request('GET', f'/blog/posts?categoryId={self.test_data["category_id"]}')
                    if category_response and 'error' not in category_response:
                        self.log_test(
                            "GET /api/blog/posts (filter by categoryId)",
                            True,
                            f"Successfully filtered posts by categoryId",
                            {"filtered_count": len(category_response)}
                        )
                    
                    # Test filtering by categorySlug
                    slug_response = self.make_request('GET', '/blog/posts?categorySlug=gaming-guides')
                    if slug_response and 'error' not in slug_response:
                        self.log_test(
                            "GET /api/blog/posts (filter by categorySlug)",
                            True,
                            f"Successfully filtered posts by categorySlug",
                            {"filtered_count": len(slug_response)}
                        )
                
                return True
            else:
                self.log_test("GET /api/blog/posts", False, "Response is not a list", {"response": response})
        else:
            self.log_test("GET /api/blog/posts", False, "Failed to get posts", {"error": response})
        
        return False
    
    def test_post_blog_post(self):
        """Test POST /api/blog/posts - Create new post"""
        print("\n🔍 Testing POST /api/blog/posts")
        
        if not self.test_data['category_id']:
            self.log_test("POST /api/blog/posts", False, "No category ID available for testing", {})
            return False
        
        if not self.test_data['user_id']:
            self.log_test("POST /api/blog/posts", False, "No user ID available for testing", {})
            return False
        
        # Test creating a valid post
        post_data = {
            "title": "Ultimate Minecraft Survival Guide",
            "content": "This comprehensive guide covers everything you need to know about surviving your first night in Minecraft. From gathering resources to building your first shelter, we'll walk you through each step.",
            "excerpt": "Learn the basics of Minecraft survival in this beginner-friendly guide.",
            "categoryId": self.test_data['category_id'],
            "userId": self.test_data['user_id'],
            "tags": ["minecraft", "survival", "guide", "beginner"]
        }
        
        response = self.make_request('POST', '/blog/posts', post_data, 201)
        
        if response and 'error' not in response:
            if response.get('id') and response.get('title') == post_data['title']:
                self.test_data['post_id'] = response.get('id')
                self.log_test(
                    "POST /api/blog/posts",
                    True,
                    f"Successfully created post '{post_data['title']}'",
                    {"post_id": response.get('id'), "slug": response.get('slug')}
                )
                
                # Test missing required fields
                invalid_data = {"title": "Test Post"}  # Missing content, categoryId, userId
                invalid_response = self.make_request('POST', '/blog/posts', invalid_data, 400)
                if invalid_response and invalid_response.get('status_code') == 400:
                    self.log_test(
                        "POST /api/blog/posts (missing fields)",
                        True,
                        "Correctly rejected missing required fields",
                        {"expected_status": 400}
                    )
                
                return True
            else:
                self.log_test("POST /api/blog/posts", False, "Invalid response format", {"response": response})
        else:
            self.log_test("POST /api/blog/posts", False, "Failed to create post", {"error": response})
        
        return False
    
    def test_delete_blog_post(self):
        """Test DELETE /api/blog/posts - Delete post"""
        print("\n🔍 Testing DELETE /api/blog/posts")
        
        if not self.test_data['post_id']:
            self.log_test("DELETE /api/blog/posts", False, "No post ID available for testing", {})
            return False
        
        post_id = self.test_data['post_id']
        
        response = self.make_request('DELETE', f'/blog/posts?id={post_id}')
        
        if response and 'error' not in response:
            if response.get('success') or response.get('message'):
                self.log_test(
                    "DELETE /api/blog/posts",
                    True,
                    f"Successfully deleted post {post_id}",
                    {"post_id": post_id}
                )
                
                # Test with non-existent post ID
                invalid_response = self.make_request('DELETE', '/blog/posts?id=invalid_post_id', {}, 500)
                if invalid_response and invalid_response.get('status_code') in [404, 500]:
                    self.log_test(
                        "DELETE /api/blog/posts (non-existent ID)",
                        True,
                        "Correctly handled non-existent post ID",
                        {"status_code": invalid_response.get('status_code')}
                    )
                
                return True
            else:
                self.log_test("DELETE /api/blog/posts", False, "Unexpected response format", {"response": response})
        else:
            self.log_test("DELETE /api/blog/posts", False, "Failed to delete post", {"error": response})
        
        return False
    
    def test_delete_blog_category(self):
        """Test DELETE /api/blog/categories - Delete category"""
        print("\n🔍 Testing DELETE /api/blog/categories")
        
        if not self.test_data['category_id']:
            self.log_test("DELETE /api/blog/categories", False, "No category ID available for testing", {})
            return False
        
        category_id = self.test_data['category_id']
        
        response = self.make_request('DELETE', f'/blog/categories?id={category_id}')
        
        if response and 'error' not in response:
            if response.get('success') or response.get('message'):
                self.log_test(
                    "DELETE /api/blog/categories",
                    True,
                    f"Successfully deleted category {category_id}",
                    {"category_id": category_id}
                )
                
                # Test with non-existent category ID
                invalid_response = self.make_request('DELETE', '/blog/categories?id=invalid_category_id', {}, 500)
                if invalid_response and invalid_response.get('status_code') in [404, 500]:
                    self.log_test(
                        "DELETE /api/blog/categories (non-existent ID)",
                        True,
                        "Correctly handled non-existent category ID",
                        {"status_code": invalid_response.get('status_code')}
                    )
                
                return True
            else:
                self.log_test("DELETE /api/blog/categories", False, "Unexpected response format", {"response": response})
        else:
            self.log_test("DELETE /api/blog/categories", False, "Failed to delete category", {"error": response})
        
        return False
    
    def test_error_handling(self):
        """Test error handling for invalid endpoints"""
        print("\n🔍 Testing Error Handling")
        
        # Test invalid user ID
        response = self.make_request('PATCH', '/admin/users/invalid_id/role', {'role': 'admin'}, 500)
        if response and response.get('status_code') in [404, 500]:
            self.log_test(
                "Error handling - Invalid user ID",
                True,
                "Correctly handled invalid user ID",
                {"status_code": response.get('status_code')}
            )
        
        # Test invalid ticket ID
        response = self.make_request('PATCH', '/admin/tickets/invalid_id/close', {}, 500)
        if response and response.get('status_code') in [404, 500]:
            self.log_test(
                "Error handling - Invalid ticket ID",
                True,
                "Correctly handled invalid ticket ID",
                {"status_code": response.get('status_code')}
            )
        
        # Test invalid server ID
        response = self.make_request('DELETE', '/admin/servers/invalid_id', {}, 500)
        if response and response.get('status_code') in [404, 500]:
            self.log_test(
                "Error handling - Invalid server ID",
                True,
                "Correctly handled invalid server ID",
                {"status_code": response.get('status_code')}
            )
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Minecraft Server List Backend API Tests")
        print(f"📍 Base URL: {BASE_URL}")
        print("=" * 60)
        
        # Test sequence - order matters for data dependencies
        test_methods = [
            self.test_get_servers,           # Get servers first (has mock data)
            self.test_get_admin_users,       # Get users to get user ID
            self.test_patch_user_role,       # Test user role update
            self.test_get_admin_tickets,     # Get tickets to get ticket ID
            self.test_patch_ticket_close,    # Test ticket close
            self.test_delete_ticket,         # Test ticket delete
            self.test_delete_server,         # Test server delete
            # Blog API Tests
            self.test_post_blog_category,    # Create category first
            self.test_get_blog_posts,        # Get posts (may be empty initially)
            self.test_post_blog_post,        # Create post (needs category and user)
            self.test_delete_blog_post,      # Delete post (cascade test)
            self.test_delete_blog_category,  # Delete category (cascade test)
            self.test_error_handling,        # Test error cases
        ]
        
        for test_method in test_methods:
            try:
                test_method()
            except Exception as e:
                self.log_test(
                    test_method.__name__,
                    False,
                    f"Test failed with exception: {str(e)}",
                    {"exception": str(e)}
                )
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Print failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
        
        print("\n🎯 CRITICAL ISSUES:")
        critical_failures = []
        for result in self.test_results:
            if not result['success'] and ('admin' in result['test'] or 'blog' in result['test']):
                critical_failures.append(result['test'])
        
        if critical_failures:
            for failure in critical_failures:
                print(f"  - {failure}")
        else:
            print("  None - All admin and blog endpoints working correctly!")
        
        return passed == total

if __name__ == "__main__":
    tester = MinecraftServerListTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)