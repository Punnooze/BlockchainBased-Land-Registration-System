
import React from 'react';
import LandRegistry from './LandRegistry';

function App() {
  return (
    <div className="bg-slate-100 h-[100vh]">
      <div className="h-[15vh] bg-slate-200 shadow-md flex items-center justify-center w-[full]">
        <h1 className="text-[32px]">Land Registry System</h1>
      </div>

      <div className="h-[85vh] flex justify-center flex-col items-center">
        <LandRegistry />
      </div>
    </div>
  );
}

export default App;
