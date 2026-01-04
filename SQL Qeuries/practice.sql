-- SELECT name AS employee_name, salary AS monthly_salary 
-- FROM employees

-- SELECT * FROM employees WHERE salary > 60000
-- SELECT * FROM employees WHERE department = 'Engineering'

-- SELECT * FROM employees
-- WHERE department = 'Engineering' AND salary > 70000
-- WHERE department = 'Engineering' OR department = 'Marketing'

-- SELECT * FROM employees
-- where department in ('Engineering', 'Marketing');

-- select * from employees
-- where salary between 60000 and 75000

-- select * from employees where name like 'R%';
-- select * from employees where name like '%a';
-- select * from employees where name like '%i%';

-- SELECT * from employees where manager_id is NULL;
-- SELECT * FROM employees WHERE manager_id IS NOT NULL;

-- SELECT * FROM employees ORDER BY salary ASC
-- SELECT * FROM employees ORDER BY salary DESC
-- SELECT * FROM employees ORDER BY department ASC, salary DESC

-- SELECT COUNT(*) FROM employees;
-- SELECT COUNT(*) FROM employees WHERE department = 'Engineering';

-- SELECT SUM(salary) AS total_salary FROM employees;
-- SELECT AVG(salary) AS average_salary FROM employees;
-- SELECT MIN(salary) AS lowest, MAX(salary) AS highest FROM employees;

-- SELECT department, COUNT(*) AS emp_count FROM employees GROUP BY department;
-- SELECT department, AVG(salary) AS avg_salary FROM employees GROUP BY department;
-- SELECT department, COUNT(*) AS emp_count FROM employees GROUP BY department HAVING COUNT(*) > 2;

-- SELECT e.name, o.product, o.amount FROM employees e INNER JOIN orders o ON e.id = o.employee_id;
-- SELECT e.name, o.product, o.amount FROM employees e LEFT JOIN orders o ON e.id = o.employee_id;
-- SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;
-- SELECT e.name, e.department, o.product FROM employees e INNER JOIN orders o ON e.id = o.employee_id;

-- SELECT * FROM employees where salary > (SELECT AVG(salary) FROM employees);
-- SELECT name, salary, department FROM employees e1 
-- WHERE salary > (
--   SELECT AVG(salary) FROM employees e2 WHERE e2.department = e1.department
-- );

-- SELECT * FROM employees
-- where id IN (SELECT DISTINCT employee_id FROM orders);

-- SELECT DISTINCT salary FROM employees
-- ORDER BY salary DESC LIMIT 1 OFFSET 1;
-- SELECT DISTINCT salary FROM employees
-- ORDER BY salary DESC LIMIT 1 OFFSET 2;

-- SELECT DISTINCT e.name FROM employees e
-- LEFT join orders o on e.id = o.employee_id WHERE o.id IS NOT NULL;

-- SELECT name, salary, RANK() OVER (ORDER BY salary DESC) as rank FROM employees;
-- SELECT name, salary, 
--	RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank 
-- FROM employees;

--------------------------------------------------------------------------------------

-- Practice Problems
-- SELECT * from employees RIGHT JOIN orders

-- Easy Ones
-- SELECT name, department FROM employees WHERE department = 'Engineering';
-- SELECT name, salary FROM employees WHERE salary > 65000 ORDER BY name ASC; 
-- SELECT department, COUNT(*) FROM employees GROUP BY department;

-- Medium Ones
-- SELECT department, AVG(salary) AS avg_salary FROM employees GROUP BY department HAVING avg_salary > 60000; 
-- SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id
-- SELECT e.name FROM employees e LEFT JOIN orders o ON e.id = o.employee_id WHERE o.employee_id IS NULL;

-- Hard Ones
-- SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 2; 
-- SELECT name, salary, department FROM employees e1 WHERE salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.department = e1.department);
-- SELECT department, SUM(salary) AS total_salary FROM employees GROUP BY department ORDER BY total_salary LIMIT 1 OFFSET 1;








