import { useState } from 'react'
import { Button } from "./components/ui/button"
import Navbar from "./components/navbar"

function App() {
  const [count, setCount] = useState(0)

  return (
  
    <>
      <Navbar />
      <h1 className='font-bold bg-amber-400'>Tailwind Test</h1>
      <Button>ShadCn for components</Button>
      
   
    </>
  );
}

export default App
