import React from 'react';import{createRoot}from'react-dom/client';import{App}from'./login';import './globals.css';createRoot(document.getElementById('root')!).render(<App/>);
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/offline-sw.js').catch(()=>{}));
