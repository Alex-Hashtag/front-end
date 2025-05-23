// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import {App} from './App'
import {AuthProvider} from './context/AuthContext'
import './styles/variables.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/forms.css'
import './styles/store.css'
import './styles/profile.css'
import './styles/admin.css'


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App/>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
)
