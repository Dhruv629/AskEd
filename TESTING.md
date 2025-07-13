# AskEd AI Assistant - Testing Guide

## 🧪 **Testing Strategy**

### **Testing Pyramid**
```
        E2E Tests (Few)
           ▲
    Integration Tests (Some)
           ▲
    Unit Tests (Many)
```

### **Test Types**
1. **Unit Tests**: Individual components and functions
2. **Integration Tests**: API endpoints and service interactions
3. **Security Tests**: Authentication and authorization
4. **Frontend Tests**: React components and user interactions
5. **End-to-End Tests**: Complete user workflows

## 🚀 **Quick Start**

### **Run All Tests**
```bash
chmod +x run-tests.sh
./run-tests.sh
```

### **Run Backend Tests Only**
```bash
cd backend
mvn test
```

### **Run Frontend Tests Only**
```bash
cd frontend
npm test
```

## 📋 **Backend Testing**

### **Test Structure**
```
src/test/java/com/asked/backend/
├── controller/
│   ├── AuthControllerTest.java
│   ├── AIControllerTest.java
│   └── FlashcardControllerTest.java
├── services/
│   ├── OpenRouterServiceTest.java
│   └── RateLimitServiceTest.java
├── dto/
│   └── ValidationUtilsTest.java
└── integration/
    └── EndToEndTest.java
```

### **Unit Tests**

#### **AuthController Tests**
- ✅ User registration with valid data
- ✅ User registration with invalid data
- ✅ User login with valid credentials
- ✅ User login with invalid credentials
- ✅ JWT token validation
- ✅ Input validation and sanitization

#### **ValidationUtils Tests**
- ✅ Email format validation
- ✅ Username format validation
- ✅ Password strength validation
- ✅ PDF file type validation
- ✅ Text sanitization
- ✅ File size validation

#### **AI Service Tests**
- ✅ Text summarization
- ✅ Flashcard generation
- ✅ Quiz generation
- ✅ Error handling for AI service failures

### **Integration Tests**

#### **API Endpoint Tests**
```java
@SpringBootTest
@AutoConfigureTestDatabase
class AIControllerIntegrationTest {
    
    @Test
    void testSummarizeEndpoint() {
        // Test complete API workflow
    }
    
    @Test
    void testFlashcardGenerationEndpoint() {
        // Test flashcard generation workflow
    }
}
```

### **Security Tests**

#### **Authentication Tests**
- ✅ JWT token generation and validation
- ✅ Password encryption and verification
- ✅ Rate limiting functionality
- ✅ Input sanitization and XSS prevention

#### **Authorization Tests**
- ✅ Protected endpoint access
- ✅ User-specific data isolation
- ✅ Role-based access control

## 🎨 **Frontend Testing**

### **Test Structure**
```
src/
├── components/
│   ├── Login.test.jsx
│   ├── Register.test.jsx
│   ├── Home.test.jsx
│   └── Flashcards.test.jsx
└── utils/
    └── api.test.js
```

### **Component Tests**

#### **Login Component Tests**
- ✅ Form rendering
- ✅ Form submission
- ✅ Error handling
- ✅ Loading states
- ✅ Dark mode support

#### **Flashcards Component Tests**
- ✅ Flashcard generation
- ✅ Flashcard display
- ✅ Practice mode functionality
- ✅ Save/load functionality

### **User Interaction Tests**
```javascript
test('user can login successfully', async () => {
  render(<Login />);
  
  fireEvent.change(screen.getByLabelText('Username'), {
    target: { value: 'testuser' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));
  
  await waitFor(() => {
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
});
```

## 🔒 **Security Testing**

### **Authentication Tests**
```java
@Test
void testJwtTokenValidation() {
    String token = jwtUtil.generateToken("testuser");
    assertTrue(jwtUtil.validateToken(token));
    assertEquals("testuser", jwtUtil.extractUsername(token));
}
```

### **Input Validation Tests**
```java
@Test
void testXssPrevention() {
    String maliciousInput = "<script>alert('xss')</script>Hello";
    String sanitized = ValidationUtils.sanitizeText(maliciousInput);
    assertEquals("Hello", sanitized);
}
```

### **Rate Limiting Tests**
```java
@Test
void testRateLimiting() {
    for (int i = 0; i < 10; i++) {
        assertTrue(rateLimitService.isAllowed("test-client", "/ai/summarize"));
    }
    assertFalse(rateLimitService.isAllowed("test-client", "/ai/summarize"));
}
```

## 📊 **Test Coverage**

### **Backend Coverage Goals**
- **Lines**: 80%
- **Branches**: 75%
- **Functions**: 85%
- **Statements**: 80%

### **Frontend Coverage Goals**
- **Lines**: 70%
- **Branches**: 65%
- **Functions**: 75%
- **Statements**: 70%

### **Generate Coverage Reports**
```bash
# Backend coverage
cd backend
mvn jacoco:report

# Frontend coverage
cd frontend
npm run test:coverage
```

## 🧪 **Test Data Management**

### **Test Database**
- H2 in-memory database for unit tests
- Test containers for integration tests
- Separate test profiles

### **Mock Data**
```java
@TestConfiguration
public class TestConfig {
    
    @Bean
    public TestDataBuilder testDataBuilder() {
        return new TestDataBuilder();
    }
}
```

## 🔄 **Continuous Integration**

### **GitHub Actions Workflow**
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Backend Tests
        run: cd backend && mvn test
      - name: Run Frontend Tests
        run: cd frontend && npm test
```

### **Pre-commit Hooks**
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running tests before commit..."
./run-tests.sh
```

## 🚨 **Troubleshooting**

### **Common Test Issues**

1. **Database Connection Issues**
   ```bash
   # Check test database configuration
   mvn test -Dspring.profiles.active=test
   ```

2. **AI Service Mocking**
   ```java
   @MockBean
   private OpenRouterService openRouterService;
   
   @Test
   void testWithMockedAI() {
       when(openRouterService.summarizeText(any(), any()))
           .thenReturn("Mocked summary");
   }
   ```

3. **Frontend Test Environment**
   ```bash
   # Clear test cache
   npm test -- --clearCache
   ```

### **Performance Testing**
```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 http://localhost:8080/actuator/health

# Memory profiling
mvn spring-boot:run -Dspring.profiles.active=test
```

## 📚 **Best Practices**

### **Test Naming**
- Use descriptive test names
- Follow the pattern: `test[MethodName]_[Scenario]_[ExpectedResult]`
- Example: `testRegisterUser_WithValidData_ReturnsSuccess`

### **Test Organization**
- Group related tests in test classes
- Use `@BeforeEach` for setup
- Use `@AfterEach` for cleanup

### **Mocking Strategy**
- Mock external dependencies
- Use test doubles for complex objects
- Avoid mocking simple data structures

### **Assertion Best Practices**
- Use specific assertions
- Test one thing per test method
- Use meaningful assertion messages

## 📈 **Test Metrics**

### **Key Metrics**
- **Test Execution Time**: < 30 seconds for unit tests
- **Coverage Threshold**: 70% minimum
- **Test Reliability**: 99% pass rate
- **Test Maintainability**: Clear, readable tests

### **Monitoring**
- Track test execution time
- Monitor coverage trends
- Alert on test failures
- Regular test maintenance

---

**🎯 Goal**: Maintain high-quality, reliable tests that catch bugs early and ensure code quality. 