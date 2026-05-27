import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/authContext';
import { SidebarProvider } from './context/sidebarContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
        <SidebarProvider>
            <App />
        </SidebarProvider>
    </AuthProvider>
);


