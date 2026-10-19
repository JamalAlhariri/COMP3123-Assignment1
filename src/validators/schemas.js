const { z } = require('zod');

const username = z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores are allowed');
const email = z.string().trim().email().max(120).transform(v => v.toLowerCase());
const password = z.string().min(8).max(100)
  .regex(/[a-z]/, 'At least one lowercase letter required')
  .regex(/[A-Z]/, 'At least one uppercase letter required')
  .regex(/[0-9]/, 'At least one number required');
const name = z.string().trim().min(1).max(80);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .refine(s => {
    const parsed = new Date(s + 'T00:00:00.000Z');
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === s;
  }, 'Invalid calendar date');
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

const signupSchema = z.object({
  username, email, password
}).strict();
const loginSchema = z.object({
  username: username.optional(),
  email: email.optional(),
  password: z.string().min(1, 'Password is required')
}).strict().refine(data => Boolean(data.username) !== Boolean(data.email), {
  message: 'Provide either username or email (not both)', path: ['username']
});
const employeeFields = z.object({
  first_name: name,
  last_name: name,
  email,
  position: z.string().trim().min(2).max(100),
  salary: z.number().finite().positive('Salary must be greater than zero').max(100000000),
  date_of_joining: date,
  department: z.string().trim().min(2).max(100)
}).strict();
const updateEmployeeSchema = employeeFields.partial().refine(d => Object.keys(d).length > 0, {
  message: 'Provide at least one field to update'
});
module.exports = { signupSchema, loginSchema, employeeFields, updateEmployeeSchema, objectId };
