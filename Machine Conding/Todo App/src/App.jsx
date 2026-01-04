import { useEffect, useState } from 'react'
import './index.css'
import './App.css'

function App() {
  const [id, setId] = useState(1);
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState("all");
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = filter === "all"
    ? tasks
    : filter === "true"
      ? tasks.filter((task) => task.completed === true)
      : tasks.filter((task) => task.completed === false);

  const handleAddTask = (e) => {
    e.preventDefault();
    setTasks([...tasks, { id: id, content: content, completed: false }]);
    setContent("");
    setId(id + 1);
  }
  const handleClearAll = () => {
    let clearedTasks = tasks.filter((task) => !task.completed);
    setTasks(clearedTasks);
  }
  const handleDeleteTask = (task) => {
    let deletedTasks = tasks.filter((innerTask) => innerTask.id !== task.id);
    setTasks(deletedTasks);
  }
  const handleToggleTask = (task) => {
    let updatedTasks = tasks.map((innerTask) => {
      if (innerTask.id === task.id) {
        return { ...innerTask, completed: !innerTask.completed };
      }
      return innerTask;
    })
    setTasks(updatedTasks);
  }

  return (
    <>
      <div className='bg-zinc-800 p-2 rounded shadow-lg h-screen w-screen text-white'>
        <h1 className='flex items-center justify-center text-2xl font-bold'>Todo Application</h1>
        <div className='flex items-center justify-center gap-2 m-8'>
          <section onClick={() => setFilter("all")} className='flex h-24 w-32 items-center justify-center gap-2 bg-zinc-700 p-2 rounded border-green-500 border-2'>
            <h3>All</h3><br></br>
            <p>{tasks.length}</p>
          </section>
          <section onClick={() => setFilter("true")} className='flex h-24 w-32 items-center justify-center gap-2 bg-zinc-700 p-2 rounded border-yellow-500 border-2'>
            <h3>Active</h3><br></br>
            <p>{tasks.filter((task) => task.completed === false).length}</p>
          </section>
          <section onClick={() => setFilter("false")} className='flex h-24 w-32 items-center justify-center gap-2 bg-zinc-700 p-2 rounded border-blue-500 border-2'>
            <h3>Completed</h3><br></br>
            <p>{tasks.filter((task) => task.completed === true).length}</p>
          </section>
          <section onClick={() => handleClearAll()} className='flex h-24 w-32 items-center justify-center gap-2 bg-zinc-500 p-2 rounded border-red-500 border-2'>
            <button className='border rounded p-2 bg-red-500 text-white'>Clear Completed Tasks</button>
          </section>
        </div>

        <form onSubmit={(e) => handleAddTask(e)} className='flex justify-center gap-2 m-8'>
          <input className='border rounded p-2' type="text" value={content} onChange={(e) => setContent(e.target.value)} maxLength={20} placeholder='Add Task' />
          <button type='submit' className='border rounded p-2 bg-green-500 text-white'>Add Task</button>
        </form>

        <div className='flex justify-center gap-2 m-8'>
          {
            filteredTasks.length > 0 ? filteredTasks.map((task, index) => {
              return (
                <div key={task.id} className={`flex flex-col bg-zinc-500 p-2 rounded justify-between gap-2 w-52 h-48 overflow-hidden ${task.completed ? "border-green-500" : "border-amber-500"} border-2`}>
                  <div className='gap-2 overflow-hidden'>
                    <h3 className='text-sm break-words line-clamp-3'>{task.content}</h3>
                    <p className={`text-8 ${task.completed ? "text-green-200" : "text-blue-200"}`}>{task.completed ? "Completed" : "Remaining"}</p>
                  </div>
                  <div className='flex justify-between gap-2'>
                    <button onClick={() => handleDeleteTask(task)} className='border rounded p-2 bg-red-500 text-white text-4'>Delete</button>
                    <button onClick={() => handleToggleTask(task)} className='border rounded p-2 bg-blue-500 text-white text-4'>Toggle</button>
                  </div>
                </div>
              )
            }) : "No Tasks"
          }
        </div>
      </div>
    </>
  )
}

export default App
