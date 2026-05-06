import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className='min-h-screen flex justify-center bg-[#f5eaf3]'>
      <div className='w-full max-w-3xl px-4 py-8 flex flex-col gap-6'>
        <App />
      </div>
    </main>
  </StrictMode>,
)
