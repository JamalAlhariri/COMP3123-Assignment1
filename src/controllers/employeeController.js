const Employee = require('../models/Employee');
const logger = require('../config/logger');

async function listEmployees(req, res, next) {
  try {
    const employees = await Employee.find({ user: req.userId }).sort({ created_at: -1 });
    res.status(200).json({ success: true, count: employees.length, data: employees });
  } catch (error) { next(error); }
}
async function createEmployee(req, res, next) {
  try {
    // Ownership ALWAYS comes from the verified token, never req.body.user.
    const employee = await Employee.create({ ...req.validatedBody, user: req.userId });
    logger.info('Employee created');
    res.status(201).json({ success: true, message: 'Employee created', data: employee });
  } catch (error) { next(error); }
}
async function ownedEmployee(req, res) {
  const employee = await Employee.findById(req.employeeId);
  if (!employee) {
    res.status(404).json({ success: false, message: 'Employee not found' });
    return null;
  }
  if (String(employee.user) !== String(req.userId)) {
    logger.warn('Employee ownership denied');
    res.status(403).json({ success: false, message: 'You cannot access this employee' });
    return null;
  }
  return employee;
}
async function getEmployee(req, res, next) {
  try {
    const employee = await ownedEmployee(req, res);
    if (employee) res.status(200).json({ success: true, data: employee });
  } catch (error) { next(error); }
}
async function updateEmployee(req, res, next) {
  try {
    const employee = await ownedEmployee(req, res);
    if (!employee) return;
    Object.assign(employee, req.validatedBody);
    await employee.save();
    logger.info('Employee updated');
    res.status(200).json({ success: true, message: 'Employee updated', data: employee });
  } catch (error) { next(error); }
}
async function deleteEmployee(req, res, next) {
  try {
    const employee = await ownedEmployee(req, res);
    if (!employee) return;
    await employee.deleteOne();
    logger.info('Employee deleted');
    res.status(204).end(); // 204 MUST NOT have a response body.
  } catch (error) { next(error); }
}
module.exports = { listEmployees, createEmployee, getEmployee, updateEmployee, deleteEmployee };
