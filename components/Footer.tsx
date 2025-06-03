import React from 'react'

const Footer = () => {
  return (
     
        <footer className="bg-white border-t-2 border-black p-6">
          <div className="max-w-6xl mx-auto text-center">
            <p className="font-bold text-lg mb-3">
              © {new Date().getFullYear()} AvaCare. All rights reserved.
            </p>
           <p className="text-sm text-gray-600">
      Built with love by Neha Haneef 💙
    </p>
          </div>
        </footer>
  )
}

export default Footer