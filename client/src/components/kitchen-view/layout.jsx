import React from 'react'
import KitchenNavbar from './navbar'
import KitchenFooter from './footer'
import { Outlet } from 'react-router-dom'


const KitchenLayout = () => {
  return (
    <div className='flex min-h-screen flex-col' >
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <KitchenNavbar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-1 md:p-6 pb-20 overflow-y-auto scrollbar-hide " >
        <Outlet />
      </main>

    {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t z-10">
        <KitchenFooter />
      </footer>

    </div>
  )
}

export default KitchenLayout