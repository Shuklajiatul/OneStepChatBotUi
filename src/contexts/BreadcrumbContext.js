"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

const BreadcrumbContext = createContext()

export function BreadcrumbProvider({ children }) {
    const [breadcrumbs, setBreadcrumbs] = useState({})

    const setBreadcrumbTitle = useCallback((segment, title) => {
        setBreadcrumbs(prev => ({
            ...prev,
            [segment]: title
        }))
    }, [])

    return (
        <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbTitle }}>
            {children}
        </BreadcrumbContext.Provider>
    )
}

export function useBreadcrumbs() {
    const context = useContext(BreadcrumbContext)
    if (!context) {
        throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider')
    }
    return context
}
