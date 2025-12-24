import React, { Suspense, useState, useEffect } from 'react';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { Loader } from '@react-three/drei';

const App: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [assembled, setAssembled] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-screen bg-arix-dark overflow-hidden selection:bg-arix-gold selection:text-arix-purpleDeep">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene assembled={assembled} />
      </div>

      {/* UI Overlay Layer */}
      <Overlay assembled={assembled} setAssembled={setAssembled} />

      {/* Loading Screen */}
      <Loader 
        containerStyles={{ background: '#05010a' }}
        innerStyles={{ background: '#2E0249', height: 2 }}
        barStyles={{ background: '#FFD700', height: 2 }}
        dataStyles={{ color: '#FFD700', fontFamily: 'serif', fontSize: '0.8rem' }}
      />
    </div>
  );
};

export default App;
