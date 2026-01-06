import { useEffect, useState } from 'react'
import './App.css'
import './index.css'

function App() {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('');

  const data = [
    { id: 1, name: "Rohit", email: "rohit@test.com", age: 22, city: "Ahmedabad" },
    { id: 2, name: "Amit", email: "amit@test.com", age: 25, city: "Mumbai" },
    { id: 3, name: "Priya", email: "priya@test.com", age: 23, city: "Delhi" },
    { id: 4, name: "Rahul", email: "rahul@test.com", age: 27, city: "Pune" },
    { id: 5, name: "Sneha", email: "sneha@test.com", age: 24, city: "Bangalore" },
    { id: 6, name: "Vikram", email: "vikram@test.com", age: 26, city: "Chennai" },
    { id: 7, name: "Neha", email: "neha@test.com", age: 21, city: "Jaipur" },
    { id: 8, name: "Arjun", email: "arjun@test.com", age: 28, city: "Kolkata" },
    { id: 9, name: "Kavya", email: "kavya@test.com", age: 22, city: "Hyderabad" },
    { id: 10, name: "Raj", email: "raj@test.com", age: 30, city: "Surat" },
    { id: 11, name: "Ananya", email: "ananya@test.com", age: 23, city: "Lucknow" },
    { id: 12, name: "Karan", email: "karan@test.com", age: 25, city: "Indore" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter(search);
      setCurrentPage(1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [search]);

  const filteredData = useMemo(() => {
    return filter === ''
      ? data
      : data.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()) || item.email.toLowerCase().includes(filter.toLowerCase()));
  }, [filter, data]);

  const itemsPerPage = 5;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }

      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, startIndex, endIndex]);

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  }


  return (
    <>
      <div>
        <h1>Table Ka Khel</h1>

        <section>
          <form>
            <input type="text" placeholder='Search Name or Email' required value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
        </section>

        <section>
          <h2>Table View</h2>
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('id')}>Id</th>
                <th onClick={() => handleSort('name')}>Name</th>
                <th onClick={() => handleSort('email')}>Email</th>
                <th onClick={() => handleSort('age')}>Age</th>
                <th onClick={() => handleSort('city')}>City</th>
              </tr>
            </thead>
            <tbody>
              {
                paginatedData.map((item, index) => {
                  return <tr key={index}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.age}</td>
                    <td>{item.city}</td>
                  </tr>
                })
              }
            </tbody>
          </table>
        </section>

        <section>
          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
          <span>{currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}</span>
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}>Next</button>
        </section>
      </div>
    </>
  )
}

export default App;
