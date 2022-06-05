INSERT INTO department(department_name)
VALUES
  ('Sales'), 
  ('Engineering'), 
  ('Finance'),
  ('Legal');

INSERT INTO role(title, salary, department_id)
VALUES
  ('Salesperson', 80000, 1),
  ('Lead Engineer', 150000, 2),
  ('Software Engineer', 120000, 3),
  ('Account Manager', 160000, 4),
  ('Accountant', 125000, 1),
  ('Legal Team Lead', 250000, 2),
  ('Lawyer', 190000, 3);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
  ('Mike', 'Chan', 1, NULL),
  ('Ashley', 'Rodriguez',2, 1),
  ('Kevin', 'Tupik',3, 2),
  ('Kumal', 'Singh',4, NULL),
  ('Malia', 'Brown',5,3),
  ('Sarah', 'Lourd',6, NULL),
  ('Tom', 'Allen',7,  4),
  ('Katherine', 'Mansfield', 2, 5),
  ('Dora', 'Carrington', 3, 6),
  ('Edward', 'Bellamy', 3, 7),
  ('Montague', 'Summers', 3, 1),
  ('Octavia', 'Butler', 3, 2);
 