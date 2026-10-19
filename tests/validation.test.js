const { test } = require('node:test');
const assert = require('node:assert/strict');
const { signupSchema, loginSchema, employeeFields, updateEmployeeSchema, objectId } = require('../src/validators/schemas');
const example = { first_name: 'Ali', last_name: 'Khan', email: 'ali@example.com', position: 'Developer', salary: 70000, date_of_joining: '2026-09-01', department: 'IT' };
test('signup requires strong password and valid email', () => {
  assert.equal(signupSchema.safeParse({ username: 'test_user', email: 'test@example.com', password: 'Pass12345' }).success, true);
  assert.equal(signupSchema.safeParse({ username: 'test_user', email: 'bad', password: 'Pass12345' }).success, false);
  assert.equal(signupSchema.safeParse({ username: 'test_user', email: 'test@example.com', password: '123' }).success, false);
});
test('login allows username or email but not both', () => {
  assert.equal(loginSchema.safeParse({ username: 'test_user', password: 'Pass12345' }).success, true);
  assert.equal(loginSchema.safeParse({ email: 'test@example.com', password: 'Pass12345' }).success, true);
  assert.equal(loginSchema.safeParse({ username: 'test_user', email: 'test@example.com', password: 'Pass12345' }).success, false);
});
test('employee validates dates, salary, extra owner', () => {
  assert.equal(employeeFields.safeParse(example).success, true);
  assert.equal(employeeFields.safeParse({ ...example, salary: -5 }).success, false);
  assert.equal(employeeFields.safeParse({ ...example, date_of_joining: '2026-02-30' }).success, false);
  assert.equal(employeeFields.safeParse({ ...example, user: 'another-id' }).success, false);
});
test('update accepts partial values but not owner or empty object', () => {
  assert.equal(updateEmployeeSchema.safeParse({ salary: 75000 }).success, true);
  assert.equal(updateEmployeeSchema.safeParse({}).success, false);
  assert.equal(updateEmployeeSchema.safeParse({ user: 'victim' }).success, false);
});
test('MongoDB ObjectId requires 24 hex characters', () => {
  assert.equal(objectId.safeParse('507f1f77bcf86cd799439011').success, true);
  assert.equal(objectId.safeParse('abc').success, false);
});
