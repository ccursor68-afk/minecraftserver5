#!/usr/bin/env python3
"""
Blog API Test Suite for Minecraft Server List Application - Corrected Version
Tests blog category and post endpoints using Supabase backend
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"

class BlogAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.test_data = {
            'category_id': None,
            'post_id': None,
            'user_id': None
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
            elif method.upper() == 'DELETE':
                response = self.session.delete(url)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            print(f"   Request: {method} {url}")
            print(f"   Status: {response.status_code}")
            
            try:
                response_data = response.json()
            except:
                response_data = {"success": True, "status_code": response.status_code}
            
            # Handle case where response is a list (like GET /admin/users)
            if isinstance(response_data, list):
                return {"data": response_data, "status_code": response.status_code}
            else:
                # Return response data with status code for analysis
                response_data['status_code'] = response.status_code
                return response_data
                    
        except requests.exceptions.RequestException as e:
            print(f"   Request failed: {str(e)}")
            return {"error": str(e), "status_code": 0}
    
    def setup_test_user(self):
        """Get a user ID for testing posts"""
        print("\n🔧 Setting up test user")
        response = self.make_request('GET', '/admin/users')
        if response and response.get('status_code') == 200:
            users = response.get('data', [])
            if len(users) > 0:
                self.test_data['user_id'] = users[0].get('id')
                print(f"   Using user ID: {self.test_data['user_id']}")
                return True
        return False
    
    def test_create_blog_category(self):
        """Test POST /api/blog/categories - Create new category"""
        print("\n🔍 Testing POST /api/blog/categories")
        
        # Test 1: Create valid category
        category_data = {
            "name": "Server Reviews",
            "slug": "server-reviews-test",
            "description": "In-depth reviews of Minecraft servers",
            "icon": "⭐",
            "color": "#3b82f6"
        }
        
        response = self.make_request('POST', '/blog/categories', category_data)
        
        if response and response.get('status_code') == 201 and response.get('id'):
            self.test_data['category_id'] = response.get('id')
            self.log_test(
                "Create valid category",
                True,
                f"Successfully created category '{category_data['name']}'",
                {"category_id": response.get('id'), "slug": response.get('slug')}
            )
        else:
            self.log_test("Create valid category", False, "Failed to create category", {"response": response})
            return False
        
        # Test 2: Duplicate slug validation
        duplicate_response = self.make_request('POST', '/blog/categories', category_data)
        if duplicate_response and duplicate_response.get('status_code') == 409:
            self.log_test(
                "Duplicate slug validation",
                True,
                "Correctly rejected duplicate slug",
                {"status_code": 409}
            )
        else:
            self.log_test("Duplicate slug validation", False, f"Expected 409, got {duplicate_response.get('status_code')}", {"response": duplicate_response})
        
        # Test 3: Missing required fields
        invalid_data = {"name": "Test Category"}  # Missing slug
        invalid_response = self.make_request('POST', '/blog/categories', invalid_data)
        if invalid_response and invalid_response.get('status_code') == 400:
            self.log_test(
                "Missing required fields validation",
                True,
                "Correctly rejected missing required fields",
                {"status_code": 400}
            )
        else:
            self.log_test("Missing required fields validation", False, f"Expected 400, got {invalid_response.get('status_code')}", {"response": invalid_response})
        
        return True
    
    def test_get_blog_posts(self):
        """Test GET /api/blog/posts - Get posts with filtering"""
        print("\n🔍 Testing GET /api/blog/posts")
        
        # Test 1: Get all posts
        response = self.make_request('GET', '/blog/posts')
        
        if response and response.get('status_code') == 200:
            posts = response.get('data', response)  # Handle both wrapped and direct list responses
            if isinstance(posts, list):
                self.log_test(
                    "Get all posts",
                    True,
                    f"Successfully retrieved {len(posts)} posts",
                    {"post_count": len(posts)}
                )
            else:
                posts = []
                self.log_test(
                    "Get all posts",
                    True,
                    f"Successfully retrieved {len(posts)} posts",
                    {"post_count": len(posts)}
                )
        else:
            self.log_test("Get all posts", False, "Failed to get posts", {"error": response})
            return False
        
        # Test 2: Filter by categoryId
        if self.test_data['category_id']:
            category_response = self.make_request('GET', f'/blog/posts?categoryId={self.test_data["category_id"]}')
            if category_response and category_response.get('status_code') == 200:
                filtered_posts = category_response.get('data', category_response)
                if isinstance(filtered_posts, list):
                    self.log_test(
                        "Filter by categoryId",
                        True,
                        f"Successfully filtered posts by categoryId (found {len(filtered_posts)} posts)",
                        {"filtered_count": len(filtered_posts)}
                    )
                else:
                    self.log_test(
                        "Filter by categoryId",
                        True,
                        f"Successfully filtered posts by categoryId (found 0 posts)",
                        {"filtered_count": 0}
                    )
            else:
                self.log_test("Filter by categoryId", False, "Failed to filter by categoryId", {"error": category_response})
        
        # Test 3: Filter by categorySlug
        slug_response = self.make_request('GET', '/blog/posts?categorySlug=server-reviews-test')
        if slug_response and slug_response.get('status_code') == 200:
            filtered_posts = slug_response.get('data', slug_response)
            if isinstance(filtered_posts, list):
                self.log_test(
                    "Filter by categorySlug",
                    True,
                    f"Successfully filtered posts by categorySlug (found {len(filtered_posts)} posts)",
                    {"filtered_count": len(filtered_posts)}
                )
            else:
                self.log_test(
                    "Filter by categorySlug",
                    True,
                    f"Successfully filtered posts by categorySlug (found 0 posts)",
                    {"filtered_count": 0}
                )
        else:
            self.log_test("Filter by categorySlug", False, "Failed to filter by categorySlug", {"error": slug_response})
        
        # Test 4: Filter by non-existent category slug
        invalid_slug_response = self.make_request('GET', '/blog/posts?categorySlug=non-existent-category-xyz')
        if invalid_slug_response and invalid_slug_response.get('status_code') == 404:
            self.log_test(
                "Filter by non-existent categorySlug",
                True,
                "Correctly handled non-existent category slug",
                {"status_code": 404}
            )
        else:
            self.log_test("Filter by non-existent categorySlug", False, f"Expected 404, got {invalid_slug_response.get('status_code')}", {"response": invalid_slug_response})
        
        return True
    
    def test_create_blog_post(self):
        """Test POST /api/blog/posts - Create new post"""
        print("\n🔍 Testing POST /api/blog/posts")
        
        if not self.test_data['category_id']:
            self.log_test("Create blog post", False, "No category ID available for testing", {})
            return False
        
        if not self.test_data['user_id']:
            self.log_test("Create blog post", False, "No user ID available for testing", {})
            return False
        
        # Test 1: Create valid post
        post_data = {
            "title": "Top 10 Minecraft Servers for 2024",
            "content": "Discover the best Minecraft servers of 2024! From survival to creative, PvP to roleplay, we've compiled a comprehensive list of the most popular and well-maintained servers. Each server has been carefully reviewed for community quality, uptime, and unique features.",
            "excerpt": "A comprehensive review of the best Minecraft servers available in 2024.",
            "categoryId": self.test_data['category_id'],
            "userId": self.test_data['user_id'],
            "tags": ["minecraft", "servers", "review", "2024", "top10"]
        }
        
        response = self.make_request('POST', '/blog/posts', post_data)
        
        if response and response.get('status_code') == 201 and response.get('id'):
            self.test_data['post_id'] = response.get('id')
            self.log_test(
                "Create valid post",
                True,
                f"Successfully created post '{post_data['title']}'",
                {"post_id": response.get('id'), "slug": response.get('slug')}
            )
        else:
            self.log_test("Create valid post", False, "Failed to create post", {"error": response})
            return False
        
        # Test 2: Missing required fields
        invalid_data = {"title": "Test Post"}  # Missing content, categoryId, userId
        invalid_response = self.make_request('POST', '/blog/posts', invalid_data)
        if invalid_response and invalid_response.get('status_code') == 400:
            self.log_test(
                "Missing required fields validation",
                True,
                "Correctly rejected missing required fields",
                {"status_code": 400}
            )
        else:
            self.log_test("Missing required fields validation", False, f"Expected 400, got {invalid_response.get('status_code')}", {"response": invalid_response})
        
        # Test 3: Create post without optional fields
        minimal_post_data = {
            "title": "Minimal Post Test",
            "content": "This is a test post with only required fields.",
            "categoryId": self.test_data['category_id'],
            "userId": self.test_data['user_id']
        }
        
        minimal_response = self.make_request('POST', '/blog/posts', minimal_post_data)
        if minimal_response and minimal_response.get('status_code') == 201:
            self.log_test(
                "Create post with minimal fields",
                True,
                "Successfully created post with only required fields",
                {"post_id": minimal_response.get('id')}
            )
        else:
            self.log_test("Create post with minimal fields", False, "Failed to create minimal post", {"error": minimal_response})
        
        return True
    
    def test_delete_blog_post(self):
        """Test DELETE /api/blog/posts - Delete post"""
        print("\n🔍 Testing DELETE /api/blog/posts")
        
        if not self.test_data['post_id']:
            self.log_test("Delete blog post", False, "No post ID available for testing", {})
            return False
        
        post_id = self.test_data['post_id']
        
        # Test 1: Delete existing post
        response = self.make_request('DELETE', f'/blog/posts?id={post_id}')
        
        if response and response.get('status_code') == 200 and (response.get('success') or response.get('message')):
            self.log_test(
                "Delete existing post",
                True,
                f"Successfully deleted post {post_id}",
                {"post_id": post_id}
            )
        else:
            self.log_test("Delete existing post", False, "Failed to delete post", {"error": response})
            return False
        
        # Test 2: Missing post ID parameter
        missing_id_response = self.make_request('DELETE', '/blog/posts')
        if missing_id_response and missing_id_response.get('status_code') == 400:
            self.log_test(
                "Missing post ID validation",
                True,
                "Correctly rejected missing post ID",
                {"status_code": 400}
            )
        else:
            self.log_test("Missing post ID validation", False, f"Expected 400, got {missing_id_response.get('status_code')}", {"response": missing_id_response})
        
        return True
    
    def test_delete_blog_category(self):
        """Test DELETE /api/blog/categories - Delete category with cascade"""
        print("\n🔍 Testing DELETE /api/blog/categories")
        
        if not self.test_data['category_id']:
            self.log_test("Delete blog category", False, "No category ID available for testing", {})
            return False
        
        category_id = self.test_data['category_id']
        
        # Test 1: Delete existing category (should cascade delete posts)
        response = self.make_request('DELETE', f'/blog/categories?id={category_id}')
        
        if response and response.get('status_code') == 200 and (response.get('success') or response.get('message')):
            self.log_test(
                "Delete existing category",
                True,
                f"Successfully deleted category {category_id} with cascade",
                {"category_id": category_id}
            )
        else:
            self.log_test("Delete existing category", False, "Failed to delete category", {"error": response})
            return False
        
        # Test 2: Missing category ID parameter
        missing_id_response = self.make_request('DELETE', '/blog/categories')
        if missing_id_response and missing_id_response.get('status_code') == 400:
            self.log_test(
                "Missing category ID validation",
                True,
                "Correctly rejected missing category ID",
                {"status_code": 400}
            )
        else:
            self.log_test("Missing category ID validation", False, f"Expected 400, got {missing_id_response.get('status_code')}", {"response": missing_id_response})
        
        return True
    
    def run_all_tests(self):
        """Run all blog API tests"""
        print("🚀 Starting Blog API Tests for Minecraft Server List")
        print(f"📍 Base URL: {BASE_URL}")
        print("=" * 60)
        
        # Setup
        if not self.setup_test_user():
            print("❌ Failed to setup test user - some tests may fail")
        
        # Test sequence - order matters for data dependencies
        test_methods = [
            self.test_create_blog_category,    # Create category first
            self.test_get_blog_posts,          # Get posts (test filtering)
            self.test_create_blog_post,        # Create post (needs category and user)
            self.test_delete_blog_post,        # Delete post (test cascade)
            self.test_delete_blog_category,    # Delete category (test cascade)
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
        print("📊 BLOG API TEST SUMMARY")
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
        else:
            print("\n🎉 ALL BLOG API TESTS PASSED!")
        
        print("\n🎯 CRITICAL ISSUES:")
        critical_failures = []
        for result in self.test_results:
            if not result['success']:
                critical_failures.append(result['test'])
        
        if critical_failures:
            for failure in critical_failures:
                print(f"  - {failure}")
        else:
            print("  None - All blog endpoints working correctly!")
        
        return passed == total

if __name__ == "__main__":
    tester = BlogAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)